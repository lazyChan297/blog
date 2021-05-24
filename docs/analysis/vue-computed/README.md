# 计算属性源码解读

假设有计算属性sum,它依赖响应式对象a
```javascript
export default {
    data() {
        return {
            a: 1
        }
    },
    computed: {
        sum() {return this.a + 1}
    }
}
```

## 初始化流程
### 1. 执行initComputed
源码位置 /src/instance/state.js

对组件的computed对象进行初始化，做了以下操作
- 1.1 将计算属性初始化为watcher实例；因为计算属性依赖别的响应式对象，同时也被其他watcher（例如渲染模版）所依赖，所以将计算属性watcher实例化
- 1.2 执行defineComputed，执行劫持计算属性的get和set方法；劫持了计算属性的get方法，便于收集计算属性的依赖和触发它所依赖的响应式对象求值方法
```javascript
    function initComputed(vm, computed) {
        const watchers = vm._computedWatchers = Object.create(null)
        for (const key in computed) {
            const userDef = computed[key]
            // 获取计算属性的求值函数 也就是 sum() {return a + 1} or sum { get() {return a + 1} }
            const getter = typeof userDef === 'function' ? userDef : userDef.get
            // 将计算属性初始化为watcher实例
            watchers[key] = new Watcher(
                vm,
                getter || noop,
                noop,
                computedWatcherOptions
            )
            if (!(key in vm)) {
                // 劫持计算属性的get和set方法
                // vm 当前组件；key computed对象的计算属性key值， userDef 计算属性的求值函数
                defineComputed(vm, key, userDef)
            }
        }
    }
    const sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get: noop,
        set: noop
    }
    function defineComputed(target, key, userDef) {
        sharedPropertyDefinition.get = createComputedGetter(key)
        Object.defineProperty(target, key, sharedPropertyDefinition)
    }
    // 劫持计算属性get方法的核心实现
    function createComputedGetter(key) {
        return function computedGetter () {
            const watcher = this._computedWatchers && this._computedWatchers[key]
            if (watcher) {
                if (watcher.dirty) {
                    watcher.evaluate()
                }
                if (Dep.target) {
                    watcher.depend()
                }
                return watcher.value
            }
        }
    }
```
计算属性`new Watcher()`后结构如下
```javascript
{
    value: undefined, // Watcher构造函数中如果lazy为true，初始化时是不会执行求值函数的，所以value为undefined
    dirty: true, // 决定缓存的值
    lazy: true,
    deps: [], 
    getter: function() {} // getter函数就是vue组件中的 sum() {this.a + 1} 
}
```


### 2. 当计算属性被访问
1. 因为劫持了它的get属性，所以访问该计算属性时会触发计算属性的依赖收集；如果dirty为true，会执行计算属性watcher.evaluate()对计算属性重新求值，否则返回原本的值（缓存）
### 3. 当计算属性求值
1. 执行watcher.evaluate()调用watcher.get()，该方法会把Dep.target设为计算属性的watcher，当访问到
计算属性所依赖的响应式对象（a）时，触发响应式对象（a)的依赖收集，dep.depend()，该方法把响应式对象a添加到计算属性watcher的deps数组中，同时把Dep.target(当前的watcher)添加到dep.subs数组中
2. 计算属性watcher求值完毕返回value，并把Dep.target重新执向访问该计算属性的watcher，如果Dep.target不为空，执行watcher.depend()，watcher.depend()会遍历它的deps执行depend()，也就是上一步的dep.depend()；所以把依赖计算属性的watcher也添加到了计算属性依赖的响应式对象的subs中

### 4. 初始化示例
假如有渲染模版watcher访问计算属性sum
``` html
<div>{{sum}}</div>
```
1. 访问sum时，触发了计算属性sum的get劫持，因为初始化时dirty为false，所以执行get劫持方法的第一步，watcher.evaluate()
当前的Dep.target为渲染模板watcher
```javascript
// 源码：/src/observer/watcher.js
if (watcher.dirty) {
    watcher.evaluate()
}
class Watcher{
    evaluate () {
        // 触发计算属性的求值函数
        this.value = this.get();
        // 求值后把dirty重新设为false
        this.dirty = false;
    } 
}
```
2. 计算属性sum开始求值，执行watcher.get()方法
```javascript
// 源码：/src/observer/watcher.js
class Watcher {
    get () {
        // 把当前Dep.target执向计算属性watcher
        pushTarget(this)
        let value
        const vm = this.vm
        // 触发了 sum() {return a + 1}
        value = this.getter.call(vm, vm)
        // 把Dep.target重新执行渲染模板watcher
        popTarget()
        return value
    }
}
```
3. 计算属性sum求值过程中，访问了响应式对象a，触发a的get劫持
```javascript
// 源码位置 /src/observer/index.js 
get: function reactiveGetter () {
    const value = getter ? getter.call(obj) : val
    if (Dep.target) {
        // 收集依赖
        dep.depend()
    }
    return value
}
// 源码位置 /src/observer/dep.js
class Dep {
    depend() {
        // 因为当前Dep.target是计算属性watcher，所以等同于 计算属性watcher.addDep(this)
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }
}
// 源码位置 /src/observer/watcher.js
class Watcher {
    addDep(dep) {
        // 此处做了去重优化
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id)
            this.newDeps.push(dep) // 把响应式对象a的dep添加到计算属性watcher.deps中
            if (!this.depIds.has(id)) {
                // 把计算属性watcher添加到响应式对象a的subs中
                dep.addSub(this)
            }
        }
    }
}
```

4. 计算属性求值完毕，执行get劫持的第二步，计算属性收集依赖
`watcher.get()`执行求值完毕后，会调用`popTarget()`，把`Dep.target`重新指向渲染模版watcher；
```javascript
if (Dep.target) {
    // 遍历watcher的deps，执行dep.depend()，也就是第三步，
    // 需要注意的是此时的Dep.target是渲染模版watcher
    watcher.depend()
}
// 源码位置 /src/observer/watcher.js
class Watcher {
    depend() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend()
        }
    }
}
```
执行完毕后所以得到，响应式对象a的subs包含计算属性watcher，渲染模版watcher


## 更新流程
当`a`修改时，`dep.notify()`遍历它的subs对象，通知sum计算属性watcher和渲染watcher执行update方法
```javascript
// /src/observer/watcher.js
class Watcher {
    update() {
        if (this.lazy) {
            this.dirty = true // 计算属性watcher命中逻辑，标记为脏数据
        } else if (this.sync) {
            this.run() // 渲染模版watcher命中逻辑
        } else {
            queueWatcher(this)
        }
    }
}
```
渲染模版watcher执行`run()`，`run()`方法触发`get()`，`get()`方法触发了`getter()`，也就是sum的求值函数，此时计算属性watcher的dirty已经被标记为true，所以访问计算属性watcher时会重新求值，求值后再把dirty标记标记为false；
## 缓存的原理
作为计算属性被实例化的watcher，dirty的初始值为true，表示该属性为脏数据；
当访问计算属性时，如果是脏数据才会执行求值方法，否则会直接返回`value`；
当计算属性的deps修改时，会触发watcher.update()，update方法就会把dirty标记为true
当依赖计算属性的watcher访问时，dirty为true就会重新求值获得新的计算属性并把dirty修改为false，所以当计算属性的deps没有被修改时，依赖计算属性的watcher求值一次后把dirty标记为true，则不会再进行求值，从而实现缓存，直到deps再次修改；