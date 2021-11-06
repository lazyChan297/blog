# NextTick和批量异步更新策略


## nextTick
nextTick是一个实现函数批量异步执行的工具函数。

### 实现原理
1. `nextTick(cb)`会把需要异步执行的函数添加到一个全局对象`callbacks`数组中
2. 判断`pending`的值，当前是否有负责批量执行异步函数的`flushCallbacks`函数注册到异步任务中
  - `pending`为`true`，表示已经有批量执行异步函数任务注册
  - `pending`为`false`，表示没有
3. 通过`timerFunc`把`flushCallbacks`函数注册到异步任务中；通过以下几种方法之一实现
  - 当前环境支持`Promise`，`timerFunc`赋值为`Promise.resolve()`把`flushCallbacks`回调放到`then`回调中
  - 当前环境支持`new MutationObserver()`
  - 当前环境支持`setImmediate`,把`timerFunc`赋值为匿名函数，函数体内把`flushCallbacks`作为参数传入`setImmediate`中
  - 当前环境支持`setTimeout`，赋值方式和`setImmediate`大体相同
4. 调用`timerFunc`把`flushCallbacks`注册到异步任务队列中
5. 异步任务开始执行，`flushCallbacks`把callbacks数组拷贝然后遍历该数组执行，同时把callbacks数组清空，将`pending`状态更新为`false`，允许注册下一轮nextTick函数


**一些变量和函数说明**
- **pending** 布尔值，表示是否可以把批量执行异步回调的函数注册到异步队列中
- **callbacks** 数组，负责保存需要注册到异步执行的函数
- **flushCallbacks** 函数，负责遍历执行callbacks并清空该数组、把pending设为false
- **next-tick** 负责注册flushCallbacks到异步任务队列中和把需要在当前同步函数执行后再执行的函数添加到callbacks数组中
- **timerFunc** 将`flushCallbacks`函数变为微任务注册到异步队列的具体实现，<br/>
原理是利用`Promise`or`setImmediate`or`MutationObserver`or`setTimeout`实现异步回调在本次同步代码执行结束后调用callbacks的函数，
这样就可以保证`callbacks`函数异步执行<br/>

以`Promise`为例
```javascript
let timerFunc
const p = Promise.resolve()
timerFunc = p.then(flushCallbacks)
```


### 实现源码
```javascript
function flushCallbacks () {
  // 这一轮的callbacks开始执行，运行注册下一轮的开关打开
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
let timerFunc
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
  }
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    // 因为nexttick是支持then操作的，所以返回了一个promise
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```





## 批量异步更新策略
实现原理是基于`nextTick`的功能，批量的把观察者实例们的更新操作都注册到异步队列中，<br/>

1. 组件更新，观察者实例执行`update`方法，如果是异步组件会进入调用`queueWatcher`函数
2. `queueWatcher`判断当前是否有观察者队列在执行更新回调，根据`flushing`字段
  - `flushing`为`true`，直接将当前观察者推入队列的末尾
  - `flushing`为`false`，根据当前观察者的id插入到对应的位置（按id从小到大排列），使队列上的观察者函数有序更新
3. 通过`waiting`字段判断是否有`flushSchedulerQueue`函数注册到异步任务队列（nextTick的callbacks数组中）
  - `waiting`为`true`，表示已经注册过
  - `waiting`为`false`，调用`nextTick(flushSchedulerQueue)`将`flushSchedulerQueue`添加到异步更新队列中
4. 当`flushSchedulerQueue`函数开始执行，把queue的观察者函数按照id进行从小到大排列，因为更新是从父-子，打开flushing开关，设置为true。该函数遍历队列上的
观察者函数执行，调用`watcher.run()`，`run`方法函数内又调用了`watcher.get()`方法，也就是此时才会去访问响应式对象的值获取最新的值，使视图更新
5. 执行完毕后，把`flushing`和`waiting`状态都改为false，并把queue队列清空


**vue中数据的更新是批量异步更新是怎么理解的？为什么要这样做？**<br/>
每当响应式对象更新了，它所有的观察者实例都会执行更新的回调，流程如下<br/>
`1：响应式对象setter` -> `2：观察者实例update` -> `3：观察者实例__update__` -> `4：patch` -> `5：视图更新`
第三步会生成新的vnode，第四步会执行diff比较，第五步会更新dom，<br/>
处于性能提升的考虑，vue会把第二步后面的步骤通过`nextTick`放到一个异步函数的队列中，<br/>
当执行完前面的同步代码，才会批量更新。




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
