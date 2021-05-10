# nextTick实现原理
nextTick是用于dom更新循环结束后再执行异步回调

## 实现原理
nextTick接收一个函数参数cb推入callbacks数组；如果当前没有callbacks数组在flush(pending为false)，则调用timerFunc并把pending设为true
timerFunc用Promise或MutationObserver或setImmediate或setTimeout等方式使flushCallbacks函数注册到微任务队列
 
flushCallbacks负责遍历执行全局callbacks并清空该函数数组，并把pending设为false

::: tip 一些变量和函数说明
- callbacks 保存需要异步回调的函数数组的全局对象
- pending 表示当前是否有nextTick任务在执行的布尔值
- timerFunc 利用`Promise`or`setImmediate`or`MutationObserver`or`setTimeout`api实现异步回调在本次同步代码执行结束后调用callbacks的函数
:::

### 源码部分
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

### 小结
nextTick负责把需要在dom更新结束后延迟调用的函数推出callbacks数组和通过pending判断是否调用timerFunc
timerFunc负责把callbacks函数注册到微任务队列，当事件循环上的同步代码执行完毕，开始执行微任务
flushCallback遍历callbacks数组并清空callbacks，把pending设为false，告知下一轮nextTick任务可以开始执行

## 手写nextTick
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
