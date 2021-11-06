# vue3的响应式原理
v3的响应式原理是基于`Proxy`代理对象，根据该对象提供的陷阱操作符实现的，<br/>
所有的响应式对象都保存在一个全局对象`targetMap`，该对象是`weakMap`对象实例。key是响应式对象源数据，值是一个map对象，<br/>
map对象的数据结构是`key: Set[]`，源数据的属性名作为key值，观察该属性的函数添加到Set集合中，<br/>
所以响应式系统的数据结构是`响应式对象：{响应式对象属性: [观察函数]}`

## 实现响应式对象
基于源数据，创建一个proxy对象实例返回。为了防止重复劫持，会在全局对象`proxyMap`判断是否有该对象的proxy对象
- 当前源数据已经存在`proxyMap`中，返回它的proxy对象
- 当前源数据不存在`proxyMap`中，基于源数据创建它的proxy对象并把源数据作为key值，proxy对象作为value值，添加到`proxyMap`中。

**proxy对象** 劫持了它的`get`和`set`陷阱操作符
- **get** 通过`Reflect.get(target,key,receiver)`返回访问的属性值；调用`track`函数依赖收集
```javascript
function createGetter() {
    return function get(target, key, receiver) {
        // 通过reflect在源数据上取值
        const res = Reflect.get(target, key, receiver);
        // 依赖收集
        track(target, "get" /* GET */, key);
        return res
    }
}
```
- **set** 通过`Reflect.set(target,key,value,receiver)` 将更新的值映射到proxy对象上，调用trigger派发更新，并把更新后的结果返回
    - **对象是数组且更新的key值是合法长度**或者**更新的是非数组对象且key值存在对象中**，调用`trigger`函数，传入`set`字段
    - 不满足以上两个条件，调用`trigger`函数，传入`add`字段
```javascript
function createSetter(shallow = false) {
    return function set(target, key, value, receiver) {
        const oldValue = target[key];
        // hadKey为true的两种判断：1、数组类型且key值在合法长度；2key存在对象的prototype中
        const hadKey = shared.isArray(target) && shared.isIntegerKey(key)
            ? Number(key) < target.length
            : shared.hasOwn(target, key);
        const result = Reflect.set(target, key, value, receiver);
        // don't trigger if target is something up in the prototype chain of original
        if (target === toRaw(receiver)) {
            if (!hadKey) {
                trigger(target, "add" /* ADD */, key, value);
            }
            else if (shared.hasChanged(value, oldValue)) {
                trigger(target, "set" /* SET */, key, value, oldValue);
            }
        }
        return result;
    };
}
```

### 响应式对象的读写
当想要把一个对象变为响应式时，reactive会返回一个基于源数据的proxy对象供程序使用，通过劫持了get和set方法，所以可以监听它的读写行为，<br/>
当想要对响应式对象修改时，会在set操作时被劫持，接着通过reflect.set映射到源数据，<br/>
当想要读取响应式对象时，会在get操作被劫持，接着通过reflect.get返回源数据<br/>

**不通过直接修改或者Object.defineProperty而是使用`Reflect`是因为**<br/>
**1. Reflect的陷阱操作符和proxy的对应，这样可以使代码更健壮**<br/>
**2. 使用Object.defineProperty如果没有该属性会报错，而reflect会返回false**

## effect
effect函数负责构造响应式对象的key值里的set集合的观察函数，通过响应式对象更新，遍历集合通知函数执行。
该函数首先会放一个effect变量函数，同时添加了uid，active的属性。
```javascript
function effect(fn, options) {
    if (isEffect(fn)) {
        fn = fn.raw;
    }
    const effect = createReactiveEffect(fn, options);
    if (!options.lazy) {
        effect();
    }
    return effect;
}
```

### createReactiveEffect
```javascript
function createReactiveEffect(fn, options) {
    const effect = function reactiveEffect() {
        if (!effect.active) {
            return options.scheduler ? undefined : fn();
        }
        if (!effectStack.includes(effect)) {
            cleanup(effect);
            try {
                enableTracking();
                effectStack.push(effect);
                activeEffect = effect;
                return fn();
            }
            finally {
                effectStack.pop();
                resetTracking();
                activeEffect = effectStack[effectStack.length - 1];
            }
        }
    };
    effect.id = uid++;
    effect.allowRecurse = !!options.allowRecurse;
    effect._isEffect = true;
    effect.active = true;
    effect.raw = fn;
    effect.deps = [];
    effect.options = options;
    return effect;
}
```

**依赖收集** v3通过调用track函数实现依赖收集
1. 执行effect(fn)，把观察函数作为参数传入，把当前的effect推出effectStack栈顶，
2. 执行观察函数fn，该函数访问了响应式对象
3. 接着从全局对象`targetMap`中取出该响应式对象的map对象，根据当前访问的key找到它的观察函数集合，如果集合中没有观察函数，那么把该观察函数添加到当前响应式对象的map对象对应的key的集合中

**track**
```javascript
function track(target, type, key) {
    if (!shouldTrack || activeEffect === undefined) {
        return;
    }
    // 找到当前响应式对象对应的map对象
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    // 根据当前访问的key找到观察者函数set集合
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Set()));
    }
    // 将当前观察者函数添加到set集合中
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
    }
}
```

**派发更新** v3通过调用trigger函数实现派发更新
1. 根据全局对象`targetMap`找到当前修改的响应式对象的map对象
2. 遍历map对象所有的key，再获取`key=>set`每一个属性值的观察函数添加到一个新的Set集合中，遍历新Set执行观察函数

```javascript
function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        // never been tracked
        return;
    }
    const effects = new Set();
    const add = (effectsToAdd) => {
        if (effectsToAdd) {
            effectsToAdd.forEach(effect => {
                if (effect !== activeEffect || effect.allowRecurse) {
                    effects.add(effect);
                }
            });
        }
    };
    if (type === "clear" /* CLEAR */) {
        // collection being cleared
        // trigger all effects for target
        depsMap.forEach(add);
    }
    else if (key === 'length' && shared.isArray(target)) {
        depsMap.forEach((dep, key) => {
            if (key === 'length' || key >= newValue) {
                add(dep);
            }
        });
    }
    else {
        // schedule runs for SET | ADD | DELETE
        if (key !== void 0) {
            add(depsMap.get(key));
        }
        // also run for iteration key on ADD | DELETE | Map.SET
        switch (type) {
            case "add" /* ADD */:
                if (!shared.isArray(target)) {
                    add(depsMap.get(ITERATE_KEY));
                    if (shared.isMap(target)) {
                        add(depsMap.get(MAP_KEY_ITERATE_KEY));
                    }
                }
                else if (shared.isIntegerKey(key)) {
                    // new index added to array -> length changes
                    add(depsMap.get('length'));
                }
                break;
            case "delete" /* DELETE */:
                if (!shared.isArray(target)) {
                    add(depsMap.get(ITERATE_KEY));
                    if (shared.isMap(target)) {
                        add(depsMap.get(MAP_KEY_ITERATE_KEY));
                    }
                }
                break;
            case "set" /* SET */:
                if (shared.isMap(target)) {
                    add(depsMap.get(ITERATE_KEY));
                }
                break;
        }
    }
    const run = (effect) => {
        if (effect.options.scheduler) {
            effect.options.scheduler(effect);
        }
        else {
            effect();
        }
    };
    effects.forEach(run);
}
```


## 响应性API
-  reactive
用于创建一个响应式对象，返回的是基于`proxy`实现的代理对象，并非原始数据。<br/>
所以当你直接对原始数据修改，reactive返回的数据也会被修改。

- readonly
创建一个只读的代理对象，对只读代理对象修改会失败并发出警告

- ref
将基本类型数据变为响应式对象，通过`value`属性获取它的值，注意在模版中渲染时不需要通过value获取

- toRefs
将返回值与`reactive`创建的对象的每一个`property`都变为`ref`对象，并且可以和原来的响应式对象连接 <br/>
对`toRefs`对象修改, `reactive`对象也会改变 <br />
该api的作用在于使`reactive`对象在不失去响应性时解构
```javascript
    const state = reactive({
      a: 1,
      b: 2
    })
    const stateAsRefs = toRefs(state)
    console.log(stateAsRefs.a) // {value: 1} 数据结构和ref对象一致
    stateAsRefs.a.value++ // 对toRefs对象修改
    console.log(state.a) // 2 reactive对象也改变了
```
- toRef
为原来的响应式对象上的某一个property创建一个ref类型的响应式对象
```javascript
    const state = reactive({
      a: 1,
      b: 2
    })
    const copy_a = toRef(state, 'a') // {value: 1}
```

- isProxy
返回是否是`reactive`or`readonly`返回的代理对象

- toRaw
返回`reactive`or`readonly`代理的原始对象


## 总结
v3的响应式系统是基于`Proxy`代理对象和`Reflect`映射对象的原理实现的<br/>
以reactive为例，当你把一个原始对象变为响应式对象时，会在全局对象`targetMap`中添加
key为原始对象，value是一个map对象的键值对<br/>
map对象的数据结构是 key为原始对象的属性值，value为观察该属性值的set函数集合<br/>

同时已经实现响应式对象的原始数据会在另一个全局对象`reactiveMap`中添加一个键值对，以原始对象为key，proxy对象为value，这样就可以防止重复劫持数据 <br/>

当把一个原始对象实现响应性后会返回一个响应式对象，也就是proxy实例，这样当你对原始对象或者响应式对象修改读取，都可以通过代理对象提供的陷阱操作符劫持<br/>

当你访问响应式对象时，get陷阱操作符会返回Reflect.get映射原始数据的值，同时进行依赖收集<br/>
当你修改响应式对象时，set陷阱操作符会返回Reflect.set映射原始数据的值进行修改，同时派发更新<br/>

使用Reflect映射的原因是Reflect的陷阱操作符和Proxy的陷阱操作符对应，这样可以使代码更健。而且如果映射的属性值是原始对象没有的，
Reflect会返回false，如果使用Object.defineProperty的话则会报错

依赖收集的时候，调用track函数实现依赖收集。首先执行effect把观察函数作为参数传入，该函数把根据当前观察函数创建的的effect对象推出effectStack栈顶，
然后执行观察函数fn，该函数访问了响应式对象，<br/>
接着从全局对象`targetMap`中取出该响应式对象的map对象，根据当前访问的key找到它的观察函数集合，<br/>
如果集合中没有观察函数，那么把该观察函数添加到当前响应式对象的map对象对应的key的集合中

派发更新的时候根据全局对象`targetMap`找到当前修改的响应式对象的map对象。
遍历map对象所有的key，再获取`key=>set`每一个属性值的观察函数添加到一个新的Set集合中，
遍历新Set执行观察函数