# computed实现原理

computed本质上是也是观察者实例Watcher对象，它被它的回调函数收集为依赖
同时也收集其它的观察者实例作为它自身的依赖。



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

## computed初始化

### initComputed
- 将计算属性初始化为watcher实例；因为计算属性依赖别的响应式对象，同时也被其他watcher（例如渲染模版）所依赖，所以将计算属性watcher实例化
- 劫持`computed`的get和set方法（`defineComputed`函数）；get方法，便于收集计算属性的依赖和触发它所依赖的响应式对象求值方法
源码如下
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
```
computed初始化后的结构
- `value: undefined` Watcher构造函数中如果lazy为true，初始化时是不会执行求值函数的，所以value为undefined
- `dirty: true` 脏数据标识，决定缓存的关键
- `lazy: true`
- `deps: []`,
- `getter: function() {} ` computed的回调函数例如sum() {this.a + 1} 
### defineComputed
劫持computed的get方法，劫持后每次触发get
- 如果dirty为true，表示为脏数据，执行`watcher.evaluate`
- 如果`Dep.target`存在，将当前的`Dep.target`也就是观察者实例收集到依赖中
```javascript
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

**通过以上初始化流程可以知道，每次computed属性被访问时，get函数会根据dirty判断是否求值，根据当前是否存在观察者实例判断是否收集依赖**

### computed被收集与收集依赖
#### computed的收集依赖
当渲染模版上的观察者函数访问computed属性时，computed的get方法被触发，<br/>
按照逻辑，computed先进行求值，求值的逻辑和普通的观察者实例watcher一样，会先把`Dep.target`指向自己，<br/>
接着执行求值函数`get`，<br/>
computed所依赖的响应式对象被访问，get触发，<br/>
响应式对象的`dep`执行`depend`，也就是`Dep.target.addDep`
```javascript
depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
}
```
观察者实例watcher的addDep会把参数里的dep添加到`watcher.deps`中，同时把自身添加到dep的subs中，<br/>
这样，**响应式对象的dep的subs中包含了computed属性，computed属性的deps中包含了响应式对象的dep**
```JavaScript
addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
}
depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
```
求值结束后把`Dep.target`归还给上一个观察者实例，也就是访问computed的观察者实例watcher对象

#### computed收集依赖它的观察者实例
computed收集依赖的方式是watcher的`depend`实例方法，该方法会遍历它的deps数组，然后逐个执行`depend`方法，<br/>
根据上一步的求值已经把响应式对象的dep添加到dep中，dep再执行一遍响应式对象的依赖收集，<br/>
所以把`Dep.target（也就是当前的渲染模版观察者实例）`添加到它的`subs`中。

自此，初始化流程执行完毕，computed和它依赖的响应式对象，和访问computed的渲染模版观察者实例对象之间的数据结构如下
- 响应式对象的dep的subs： `[computed, computed的渲染模版观察者实例]`
- computed的deps： `[应式对象的dep]`

## computed更新
当响应式对象更新时，遍历它`dep`的`subs`，所以依赖它的computed，和依赖computed的观察者实例都会接连更新

## 实现缓存（惰性求值）的原理
computed不是每次访问都会去计算的，而是根据`dirty`值来判断是否重新求值。
当computed依赖的响应式属性更新后，computed和依赖computed的观察者实例watcher必然也会更新，`watcher.update`方法会执行`this.dirty = true`
当响应式属性更新后，观察者实例watcher再次访问computed，此时`dirty`为`true`，那么会执行`evaluate()`重新求值，接着把`dirty`改为false，实现缓存