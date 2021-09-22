# vue3的响应式原理


## 响应性API

###  reactive
用于创建一个响应式对象，返回的是基于`proxy`实现的代理对象，并非原始数据。<br/>
所以当你直接对原始数据修改，reactive返回的数据也会被修改。

### readonly
创建一个只读的代理对象，对只读代理对象修改会失败并发出警告

### ref
将基本类型数据变为响应式对象，通过`value`属性获取它的值，注意在模版中渲染时不需要通过value获取

### toRefs
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
### toRef
为原来的响应式对象上的某一个property创建一个ref类型的响应式对象
```javascript
    const state = reactive({
      a: 1,
      b: 2
    })
    const copy_a = toRef(state, 'a') // {value: 1}
```

### isProxy
返回是否是`reactive`or`readonly`返回的代理对象

### toRaw
返回`reactive`or`readonly`代理的原始对象


## reactive

通过`reactive`函数返回一个对原始数据所有属性进行拦截的proxy对象；

首先通过一个全局对象`reactiveMap`（该对象是弱引用类型的WeakMap）判断原始对象是否存在，<br />
如果不存在，为`reactiveMap`添加一个key值为原始对象，value值proxy实例的键值对 <br />
所以后续对该响应式对象进行读写时，都可以进行拦截。 <br />

### 收集依赖
当访问对象时，先从`targetMap`从取出key值是原始对象的键值对`depsMap` <br/>，
如果不存在，为`depsMap`赋值，也就是为`targetMap`增加一个键值为原始对象`target`，value值为map的数据类型的键值对 <br/>
获取`dep`，从`depsMap.get(key)`获取要访问的key的观察函数集合，也就是响应式对象某一个属性的观察函数集合，结构是set <br/>
如果`dep`不存在，为它设置一个默认值空set

### 取值
收集依赖同时还会返回该属性值，通过`Reflect.get(target, key, receiver)`，target是原始对象，receiver是返回的代理对象（也可以理解为响应式对象），所以对target.key的取值会映射的proxy对象上
#### 为什么不直接通过target.key取值？
因为receiver可以将作用域指向代理对象

### 派发更新
当对代理的对象修改时，通过Reflect.set(target, key, receiver)将修改的行为映射到原始数据对象中，<br/>
核心是通过执行`trigger`方法派发更新。
1. 判断`targetMap`有没有对应target的值，如果没有说明没有收集依赖不再往下执行




### 声明一个响应式对象
```javascript
    const book = reactive({
        id: 1,
        name: 'javascript'
    })
```
### reactive函数原理
将一个对象变为响应式对象，返回的不是原始数据而是基于该原始数据映射的代理对象
```javascript
function reactive() {
    // 如果该对象是只读对象，直接返回该对象
    if (target && target["__v_isReadonly" /* IS_READONLY */]) {
        return target;
    }
    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers)
}
```

### createReactiveObject
```javascript
function createReactiveObject() {
    // 类型判断如果不是对象
    if (!shared.isObject(target)) {
        {
            console.warn(`value cannot be made reactive: ${String(target)}`);
        }
        return target;
    }
    // 获取全局的WeakMap对象
    const proxyMap = isReadonly ? readonlyMap : reactiveMap;
    // 判断该对象是否已经添加了proxy
    const existingProxy = proxyMap.get(target);
    // 已经添加proxy
    if (existingProxy) {
        return existingProxy;
    }
    const targetType = getTargetType(target);
    if (targetType === 0 /* INVALID */) {
        return target;
    }
    const proxy = new Proxy(target, targetType === 2 /* COLLECTION */ ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}
```

### 收集以来的createGetter
```javascript
    function createGetter() {
        return function get() {

        }
    }
```
