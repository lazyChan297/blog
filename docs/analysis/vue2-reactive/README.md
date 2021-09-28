# vue2的响应式原理

## 实现响应式对象
### observe
**先把对象变为可观察的**<br/>
在组件初始化时，执行`initState`or`initData`or`initProps`时调用该函数，实现响应式。<br/>
实现可观察的对象会携带__ob__属性，属性值是一个被`Object.defineProperty`处理过的对象
:::tip 入参和返回值说明
- 参数1 value: 需要实现响应式的对象
- 参数2 asRootData: 是否为根对象
- 返回值: 一个被`Object.defineProperty`处理过的对象
:::

源码分析， 
```javascript
function observe (value, asRootData) {
    // 类型判断
    if (!isObject(value) || value instanceof VNode) {
      return
    }
    // 定义一个响应式对象作为返回值并会挂载到对象的__ob__属性中，后续用该属性判断是否已经是响应式对象
    var ob;
    // 个人理解，这一步是为了防止递归data的属性时出现循环引用，如果属性值已经存在__ob__则不再对它进行响应式操作
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else if (
      shouldObserve &&
      !isServerRendering() &&
      (Array.isArray(value) || isPlainObject(value)) &&
      Object.isExtensible(value) &&
      !value._isVue
    ) {
      ob = new Observer(value);
    }
    if (asRootData && ob) {
      ob.vmCount++;
    }
    return ob
}
```
### Observer
该构造函数负责返回一个可观察的对象实例，通过`def`方法挂载到原对象的`__ob__`属性上
源码分析，
```javascript
class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // 
  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    // 将__ob__属性添加到当前对象中
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      // 对数组实现可观察
      this.observeArray(value)
    } else {
        // 对对象实现可观察
      this.walk(value)
    }
  }
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
  
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
```
注意点
**1.实现对象响应式时，如何解决循环引用的问题？**
个人理解，通过时候有`__ob__`这一属性值判断，如果属性值已经存在__ob__则不再对它进行响应式操作
**2.对对象和数组实现响应式操作有什么区别？**
- 对对象执行`defineReactive`方法，也就是劫持`get`&`set`
- 对数组遍历，为每一个元素再一次进行观察`observe`

## 收集依赖
### Dep
订阅者构造函数，该函数的实例`dep`，负责收集依赖，对依赖派发更新。<br/>
该构造函数的`Target`属性负责指向当前的观察者watcher，<br/>
当劫持响应式对象，生成它的`Observer`（__ob__）实例时，会包含一个`dep`实例属性。
当访问了响应式对象会触发`get`劫持，`dep`则把当前的观察者添加到subs实例中（属性负责收集观察者）<br/>
当修改了响应式对象会触发`set`劫持，`dep`则会遍历前面收集的`subs`，让集合里的观察者执行`update`

### Watcher
观察者构造函数，该函数的实例`watcher`负责观察实现响应式的可观察对象，<br/>
`watcher`的value执行它观察的响应式对象。<br/>
初始化该对象时，会进行一次求值，获取它所观察的对象的值，此时会触发响应式对象的`get`，从而完成依赖收集
源码分析，
```javascript
class Watcher {
    constructor() {
        // 初始化该对象时，会进行一次求值，获取它所观察的对象的值
        this.value = this.get()
    }
    get() {
        // 把Dep.target指向自己
        pushTarget(this)
        let value
        // 触发收集依赖
        value = this.getter.call(vm, vm)
        // 把Dep.target还给上一个watcher
        popTarget()
    }
}
```

## 派发更新
响应式对象的set方法被触发，响应式对象的`dep`遍历了它的`subs`，`watcher`便会开始执行它的`update`方法。<br/>
`update`源码分析，
```javascript
update () {
    // 该属性与computed属性有关
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      // 如果是同步组件，立即更新
      this.run()
    } else {
      // 添加到批量异步更新队列
      queueWatcher(this)
    }
  }
```

`run`和`get`源码分析，(部分源码已忽略，仅保证逻辑通顺)
```javascript
    get() {
        // 将当前watcher压入栈
        pushTarget(this)
        // getter也就是updateComponent，在此处触发视图更新
        value = this.getter.call(vm, vm)
        return value
    }
    run() {
        // 获取新的响应式对象，
        const value = this.get()
        // 执行更新后的回调
        this.cb.call(this.vm, value, oldValue)
    }
```

注意点<br/>
**data修改时是如何触发视图更新的？**<br/>
如果更新的是异步组件（默认情况下都是异步）时，`watcher`实例执行它的求值方法`get`，<br/>
该方法会调用`updateComponent`，同时返回最新的响应式对象的值，就是在该函数调用时触发`patch`，从而视图重新渲染<br/>


