# NextTick实现原理和批量异步更新策略

::: tip NextTick
官方的解释是：在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM<br/>
更通俗的解释：当你修改的数据涉及到dom的更新，想要确保dom已经更新后再进行下一步操作，那么你就在`nextTick`中执行</br>
本质是通过`Promise`or`setImmediate`or`MutationObserver`or`setTimeout`（具体使用哪一种，看客户端兼容性）<br/>将函数注册到微任务队列中。
:::
::: tip 批量异步更新策略
vue中数据的更新是批量异步更新是怎么理解的？<br/>
每当响应式对象更新了，它所有的观察者实例都会执行更新的回调，流程如下<br/>
`1：响应式对象setter` -> `2：观察者实例update` -> `3：观察者实例__update__` -> `4：patch` -> `5：视图更新`


第三步会生成新的vnode，第四步会执行diff比较，第五步会更新dom，<br/>
处于性能提升的考虑，vue会把第二步后面的步骤通过`nextTick`放到一个异步函数的队列中，<br/>
当执行完前面的同步代码，才会批量更新。
:::




## NextTick实现原理

::: tip 一些变量和函数说明
- **pending** 布尔值，表示是否可以批量异步执行的函数注册的异步队列中
- **callbacks** 数组，负责保存需要注册到异步队列的函数
- **flushCallbacks** 函数，负责遍历执行callbacks并清空该数组、把pending设为false
- **next-tick** 负责把需要注册到微任务队列的函数添加到callbacks数组中、把`flushCallbacks`注册异步队列中
- **timerFunc** 将`flushCallbacks`函数变为微任务注册到异步队列的具体实现，<br/>
原理是利用`Promise`or`setImmediate`or`MutationObserver`or`setTimeout`实现异步回调在本次同步代码执行结束后调用callbacks的函数，
这样就可以保证`callbacks`函数异步执行<br/>

以`Promise`为例
```javascript
let timerFunc
const p = Promise.resolve()
timerFunc = p.then(flushCallbacks)
```
:::

1. `nextTick`接收一个函数参数cb推入callbacks数组，<br/>
2. 实现一个`flushCallbacks`函数，它负责遍历callbacks执行、打开可以注册新的微任务到异步队列的开关、清空callbacks数组
3. 每次把需要注册到微任务队列的函数添加到callbacks时还会检查是否已经把遍历callbacks的函数注册到微任务队列中如果没有则注册，<br>
同时把`pending`设置为true，不允许同时注册多个批量执行的微任务到队列中
4. 当微任务`flushCallbacks`开始执行，可以注册新的微任务到异步队列的开关被打开，批量异步执行的数组被清空
### nextTick
```javascript
function nextTick(cb, ctx) {
    callbacks.push(function () {
        if (cb) {
            cb.call(ctx);
        }
    });
    if (!pending) {
        pending = true;
        timerFunc();
    }
}
```

### timeFunc
```javascript
var timerFunc
if (typeof Promise !== 'undefined' && isNative(Promise)) {
    // 支持promise api，flushCallback进入微任务队列
    timerFunc = function () {
    p.then(flushCallbacks)
  }
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) || MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
    // 支持MutationObserver api
} 
```

### flushCallbacks
把pending设为false 遍历callbacks并执行回调函数，
```javascript
function flushCallbacks () {
  pending = false;
  var copies = callbacks.slice(0);
  callbacks.length = 0;
  for (var i = 0; i < copies.length; i++) {
    copies[i]();
  }
}
```

## 批量异步更新实现原理
实现原理就是基于`nextTick`的功能，批量的把观察者实例们都注册到异步队列中。

1. **当响应式对象更新后，通知它的观察者函数更新**<br/>
如果是异步更新的组件，这一步骤只会把该组件中响应式对象的观察者添加到队列（所有异步更新的观察者的队列队）中排队，<br/>
并不会真正执行更新的回调
```javascript
update () {
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }
```

2. **将观察者添加到异步更新队列**<br/>
在`queueWatcher`函数中判断，如果已经存在队列中，不做任何操作。如果不存在则添加到队列中
```javascript
    const id = watcher.id
        if (has[id] == null) {
            has[id] = true
        }
    }
```
3. **将当前的观察者实例插入正确的顺序中**
在`queueWatcher`函数中处理，如果此时已经在遍历异步更新的队列，把当前的观察者实例按顺序(根据id)插入到队列中对应的位置，<br/>
目的是为了让它顺序执行，<br/>
如果没有在遍历异步更新的队列，让当前观察者实例直接到队列的末端
```javascript  
    if (!flushing) {
      queue.push(watcher)
    } else {
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
```
4. **将批量执行异步更新的函数注册到微任务队列中，等待执行<br/>**
`flushSchedulerQueue`函数负责遍历队列里每一个观察者函数各自的异步更新方法，<br/>
所以把`flushSchedulerQueue`函数注册到微任务队列中，<br/>
如果当前没有`nextTick`任务在等待，开启本轮nextTick，对前面的观察者实例执行异步更新回调
```javascript
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
```

5. **遍历执行每一个观察者实例的异步更新方法<br/>**
对队列的观察者实例们从小到大排序，<br/>
然后将每一个观察者实例移除队列，因为它们已经执行各自的更新回调，不再需要排队<br/>
接着执行它们的`run()`方法，也就是触发试图更新的方法

在`flushSchedulerQueue`中处理
```javascript
// 排序
queue.sort((a, b) => a.id - b.id)
for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    // 移除当前观察者
    has[id] = null
    // 触发试图更新
    watcher.run()
  }
```

6. **重置状态** <br/>
把队列清空，
`waiting`设置为`false`，表示当前没有nextTick任务<br/>
`flushing`设置为`false`, 表示当前没有队列在遍历<br/>
`has`设置为空，表示当前队列没有观察者实例<br/>

## 手写nextTick并实现批量异步更新
```javascript
let uid = 0
class Watcher {
    constructor() {
        // uid为watcher唯一标识
        this.id = ++uid
    }
    update() {
        console.log(`${this.id} update`)
        // 每一个watcher(观察者)被update后会调用queueWatcher(this)
        queueWatcher(this)
    }
    run() {
        console.log(`${this.id} run`)
    }
}
let has = {}
let queue = []
let waiting = false
// queueWatcher函数负责把当前watcher推入队列并做去重处理（watcher用id作为唯一标识）
// waiting用来标记本轮更新是否有nextTick队列在等候，没有则调用nextTick(flushQueue)清空当前队列的回调任务并把waiting标识为true
function queueWatcher(watcher) {
    const id = watcher.id
    if (!has[id]) {
        has[id] = true
        // 把update的watcher推入队列
        queue.push(watcher)
    }
    if (!waiting) {
        waiting = true
        nextTick(flushQueue)
    }
}
let callbacks = []
let pending = false

//nextTick函数内部实现了一个函数timeFunc，可以异步执行flushCallbacks。并接收一个函数参数推入callbacks数组，等待flushCallbacks时执行
//  （用Promise或MutationObserver或setImmediate或setTimeout等方式）
function nextTick(cb) {
    callbacks.push(cb)
    if (!pending) {
        pending = true
        // 根据eventLoop机制实现异步回调
        setTimeout(flushCallbacks, 0);
    }
}

// flushCallbacks负责遍历全局callbacks并清空它，用pending来标识是否在flush
function flushCallbacks() {
    pending = false
    // 复制callbacks
    let copies = callbacks.slice(0)
    // 清空callbacks
    callbacks.length = 0
    for (let i = 0; i < copies.length; i++) {
        copies[i]()
    }
}

// 当flushQueue执行，把queue里的watcher遍历并执行watcher.run()
function flushQueue() {
    let watcher, id
    for (let i =0;i<queue.length;i++) {
        watcher = queue[i]
        id = watcher.id
        has[id] = null
        watcher.run()
    }
    // 结束后把waiting重新设置为false，当前nextTick上的任务执行完毕
    waiting = false
}

(function() {
    let w1 = new Watcher()
    let w2 = new Watcher()

    w1.update()
    w1.update()
    w2.update()
})()
```
