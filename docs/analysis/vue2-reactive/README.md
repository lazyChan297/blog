# vue2的响应式原理
v2的响应式系统是通过劫持数据，将数据变为响应式（可观察）对象，结合观察者模式实现的
## 实现响应式对象
### observe
**先把对象变为可观察的**<br/>
在组件初始化时，执行`initState`、`initData`、`initProps`时调用`observe`函数，把对象变为响应式对象，满足可观察的需求<br/>
该函数通过`Object.defineProperty`劫持对象的`get`和`set`方法并生成一个响应式对象`ob`挂载到对象的私有属性`__ob__`上。<br/>
如果对象的属性值仍然是对象则递归调用`observe`，为了防止循环引用会在劫持前先判断该对象是否拥有`__ob__`属性。<br/>
把函数变为响应式对象，源码分析
```javascript
function observe (value, asRootData) {
    // 类型判断
    if (!isObject(value) || value instanceof VNode) {
      return
    }
    // 定义一个响应式对象作为返回值并会挂载到对象的__ob__属性中，后续用该属性判断是否已经是响应式对象
    var ob;
    // 这一步是为了防止递归data的属性时出现循环引用，如果属性值已经存在__ob__则不再对它进行响应式操作
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
### new Observer
`Observer`构造函数负责返回一个可观察的对象实例，通过`def`方法挂载到原对象的`__ob__`属性上，<br/>
如果对象是数组，则遍历数组然后逐个把元素变为可观察对象，并把v2实现数据变化监听的方法添加到数组的原型上<br/>
否则获取对象所有的`key`，通过`defineReactive`函数，劫持他们的`get`和`set`属性。<br/>
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
- 对数组遍历，为每一个元素再一次进行观察`observe`，并且把劫持数据变化的`arrayMethods`方法添加到响应式数组的原型对象上

### Dep
订阅者对象负责为响应式对象被访问`get`方法触发时，收集依赖、响应式对象被修改时，`set`方法触发派发更新；<br/>
收集依赖时，把当前的观察者添加到订阅者对象的实例属性`subs`中，<br/>
派发更新时，遍历它的`subs`通知观察者更新，<br/>
部分源码如下<br/>
```javascript
export default class Dep {
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
  notify () {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
```
### Watcher
模版渲染时会使用栈的数据结构来维护所有的观察者对象，当前的观察者对象`Dep.target`总是指向栈顶的观察者对象。<br/>
该对象有几个比较核心的方法，<br/>
1. get
当模版解析到组件渲染响应式对象时，会把该组件生成观察者对象。<br/>
该实例初始化时会进行求值函数，获取响应式对象的值并渲染到模版上。
求值过程中中，首先吧`Dep.target`指向自身，当访问响应式对象`get`方法被触发时就会把`Dep.target`添加到响应式对象的dep属性对象的`subs`中。<br/>
```javascript
get () {
    // 把dep.target指向自己
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      // this.getter就是updateComponent函数
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }
```
2. update
当它依赖的响应式对象更新时，响应式对象的订阅者实例遍历subs，通知它执行`update`方法。
```javascript
update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }
```

3. run
当观察者对象更新时，update方法会把它更新的行为添加到一个异步队列中，等到同步代码执行完毕才会执行它的`run`方法，从而进行视图更新。
```javascript
run () {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }
```

## 收集依赖
当模版解析渲染到访问响应式对象的组件时，创建一个观察者实例，该实例把自身推入观察者栈的栈顶，使Dep.target指向自己，接着执行求值函数，<br/>
访问响应式对象触发`get`，响应式对象的订阅者对象把`Dep.target`添加到响应式对象的`subs`中，并把自身的值返回，<br/>
接着当前观察者对象推出栈，把`Dep.target`交换给上一个观察者对象，完成依赖收集。

## 派发更新
当响应式对象更新时，它的订阅者遍历收集到的观察者，调用`update`方法实现派发更新。




注意点<br/>
**data修改时是如何触发视图更新的？**<br/>
如果更新的是异步组件（默认情况下都是异步）时，`watcher`实例执行它的求值方法`get`，<br/>
该方法会调用`updateComponent`，同时返回最新的响应式对象的值，就是在该函数调用时触发`patch`，从而视图重新渲染<br/>

## 总结
1. 调用`observe`函数，为了防止循环引用会在劫持前先判断该对象是否拥有`__ob__`属性，如果没有会创建一个Observe对象实例并添加到当前对象的__proto__属性上，如果存在则返回响应式属性值
2. Observe对象实例会创建一个订阅者实例对象绑定到它的dep属性上，负责依赖收集和派发更新，如果该对象是数组则把v2实现数据变化监听的方法添加到该数组的__proto__的属性上，接着遍历数组对每一个元素重复observe函数的操作。非数组对象则调用`defineReactive`函数
3. 通过`Object.keys()`获取对象上所有的key，遍历调用`defineReactive`函数，如果当前的key值仍然引用类型则递归调用`observe`函数。通过`Object.defineProperty`，劫持`get`和`set`方法，使对象变为响应式对象
  - get劫持，该对象的dep属性也就是订阅者实例会把全局对象的`Dep.target`添加到`dep.subs`数组，完成观察者的收集
  - set劫持，会遍历该对象的dep对象的subs数组，通知观察者触发更新
4. **依赖收集**，当模版解析到组件渲染响应式对象时，为该组件实现一个观察者实例，实例初始化时，会调用它的属性方法`get`
  - 调用`pushTarget(this)`，把Dep.target指向自己
  - 执行`getter`方法，也就是`updateComponent`，此时响应式对象被访问，劫持的get方法触发并返回响应式对象的值
  - 调用`popTarget`把Dep.target的指向重新交还给上一个观察者函数
5. **派发更新** 当响应式对象更新时，遍历它的订阅者对象的`subs`数组，通知观察者执行`update`方法，`update`方法会把当前观察者添加到一个异步队列中，等到同步代码执行完毕才会执行它的`run`方法，从而进行视图更新。


