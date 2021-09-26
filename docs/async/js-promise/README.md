# Promise

## Promise的使用规则
1. `new Promise`的构造函数是同步代码且只会使用一次；<br />
`.then()`和`.catch()`是在本次事件循环结束后执行，可以多次调用

2. `resolve`和`reject`方法负责把promise对象的状态改为`fulfilled`or`rejected`；<br />
注意构造`new Promise(f1, f2)`的时候`resolve`和`reject`的参数名可以为任意值，<br />
但是第一个参数始终意味着resolve，第二个始终意味着reject
3. promise的状态一旦由`pending` 变为`fulfilled`或`rejected`就不能再进行变更；
4. `.then()`和`.catch()`回调方法接收函数作为参数，如果传入的参数类型不是函数会发生值穿透，<br />
穿透的值是最后一个参入的参数类型是函数的返回值或者resolve的值
5. `.then()`方法返回全新的promise2对象，<br />
promise2对象的状态由then方法传入的函数参数决定，<br />
如果函数参数返回值为null或者不是一个具备then方法的值，promise2的状态为`fulfilled`,<br />
如果是具备then方法的对象那么promise2的状态由then方法执行结果决定

## 手写Promise

### promise构造函数
```javascript
const PENDING = PENDING
const FULFILLED = FULFILLED
const REJECTED = REJECTED
function MyPromise(fn) {
    // promise状态值，初始值的pending
    this.status = PENDING
    // promise被resolved的值，初始值为null
    this.value = null
    // promise被rejected的值，初始值为null
    this.reason = null
    // promise被resolve后的回调函数数组
    this.onFulfilledCallbacks = []
    // promise被reject后的回调函数数组
    this.onRejectedCallbacks = []
    // 将promise对象resolve的处理函数
    function resolve(value) {
        // 只有状态为pending才可以被resolve
        if (this.status === PENDING) {
            // 用setTimeout包裹，使resolved的回调在下一个事件循环中执行
            setTimeout(() => {
                this.value = value
                this.status = FULFILLED
                this.onFulfilledCallbacks.map(cb => cb(value))
            })
        }
    }
    // 将promise对象reject的处理函数
    function reject(reason) {
        // 只有状态为pending才可以被reject
        if (this.status === PENDING) {
            // 用setTimeout包裹，使resolved的回调在下一个事件循环中执行
            setTimeout(() => {
                this.reason = reason
                this.status = REJECTED
                this.onRejectedCallbacks.map(cb => cb(reason))
            })
        }
    }
    // 执行构造函数的同步代码,使用try..catch包裹，函数执行时报错直接reject
    try {
        fn(resolve, reject)
    } catch(e) {
        reject(e)
    }
}
```

### 实现then
满足以下需求
1. 满足then()返回值是一个promise对象
2. 如果then方法传入的函数参数返回值是具备then方法的对象，返回的promise对象由then的执行结果决定；如果传入的函数参数没有返回值或者不是具备then方法的对象那么返回的promise对象状态为fulfilled
```javascript
// then()返回的一个全新的promise对象（promise2），promise2的状态以传入的参数函数执行结果决定；
// 假如参数函数没有返回值或者返回的不是具备thenable方法的值 那么promise2的状态为fulfilled的
MyPromise.prototype.then((onResolved, onRejected) => {
    // 防止onResolved和onRejected 传入的值不是函数
    onResolved = typeof onResolved === 'function' ? onResolved : (value) => value
    onRejected = typeof onRejected === 'function' ? onRejected : (reason) => reason
    let promise2
    // 如果promise的状态还是pending,则把onResolved和onRejected添加到回调函数的数组中
    if (this.status === PENDING) {
        return promise2 = new MyPromise((resolve, reject) => {
            this.onFulfilledCallbacks.push((value) => {
                try {
                    let x = onResolved(value)
                    // 解析x，如果x是具备then方法的对象，promise2的状态由then方法返回的结果决定否则为fulfilled
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            })
            this.onRejectedCallbacks.push((reason) => {
                try {
                    let x = onRejected(reason)
                    // 解析x，如果x是具备then方法的对象，promise2的状态由then方法返回的结果决定否则为fulfilled
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            })
        })
    }
    if (this.status === FULFILLED) {
        return promise2 = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let x = onResolved(this.value)
                    // 解析x，如果x是具备then方法的对象，promise2的状态由then方法返回的结果决定否则为fulfilled
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            })
        })
    }
    if (this.status === REJECTED) {
        return promise2 = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let x = onRejected(this.reason)
                    // 解析x，如果x是具备then方法的对象，promise2的状态由then方法返回的结果决定否则为fulfilled
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            })
        })
    }
})
// resolvePromise函数用于解析then方法返回的promise对象的状态
function resolvePromise(promise2, x, resolve, reject) {
    // 新返回的promise对象不能是promise2本身
    if (x === promise2) {
        throw new Error()
    }
    if (x instanceof MyPromise) {
        if (x.status === PENDING) {
            x.then(y => resolvePromise(x, y, resolve,reject), e => reject(e))
        } else {
            x.then(resolve, reject)
        }
    } else {
        resolve(x)
    }
}
```

### 实现catch
catch()本质就是then方法里的onRejected回调
```javascript
// catch方法
MyPromise.prototype.catch = function(onRejected) {
    this.then(null, onRejected)
}
```

### 实现resolve
返回值是fulfilled状态的promise对象
```javascript
MyPromise.resolve = function(value) {
    return new MyPromise((resolve) => {
        resolve(value)
    })
}
```

### 实现reject
返回值是rejected状态的promise对象
```javascript
MyPromise.reject = function(reason) {
    return new MyPromise((resolve, reject) => {
        reject(reason)
    })
}
```

### race
- 入参：数组，如果数组包含不是promise的对象，要将它转换为promise对象
- 返回值：`Promise`对象，如果有任意一个元素被`resolve`，状态就是`fulfilled`，value是resolved的值，`reject`同理
```javascript
MyPromise.race = function(promises) {
    // 边界条件判断1, 如果数组为空
    if (!promises.length) return Promise.resolve([])
    // 边界条件判断2，如果数组里包含不是promise的对象
    let _promise = promises.map((item) => item instanceof Promise ? item : Promise.resolve(item))
    // 满足返回值条件，必须是一个promise对象且value是resolved的值
    return new Promise((resolve, reject) => {
        _promise.forEach((promise) => {
        promise.then((value) => {
            resolve(value)
        }, reason => {
            reject(reason)
        })
        })
    })
}
```

### all
- 入参：数组，如果数组包含不是promise的对象，要将它转换为promise对象
- 返回值： `Promise`对象，value是全部元素的`resolve`的返回值
接收promises对象数组；如果所有的promise对象被resolved，resolve的参数是所有promise对象的结果数组，promise对象的状态是fulfilled；
```javascript
MyPromise.all = function(promises) {
    // 边界条件判断1, 如果数组为空
    if (!promises.length) return Promise.resolve([])
    // 边界条件判断2，如果数组里包含不是promise的对象
    let _promises = promises.map(item => {
        return item instanceof Promise ? item : Promise.resolve(item)
    })
    let results = []
    // 满足返回值条件，必须是一个promise对象且value是promises的返回值数组
    return new Promise((resolve, reject) => {
        _promises.forEach((promise, index) => {
            promise.then((value) => {
                results.push(value)
                // 边界条件判断3，所有的promise都已经被resolved
                if (index === promises.length -1) {
                resolve(results)
                }
            }, reason => {
                reject(reason)
            })
        })
    })
}
```



### 实现finally方法
接收一个函数作为参数，不论promise的状态是什么最终都会执行
```javascript
    MyPromise.prototype.finally = function(callback) {
        // 缓存MyPromise的构造方法，使用MyPromise.resolve和MyPromise.reject把callback的执行结果变为具备then方法的对象并调用then方法
        const constructor = this.constructor
        this.then(
            value => constructor.resolve(callback()).then(() => value),
            reason => constructor.reject(callback()).then(() => reason)
        )
    }
```

### 实现done方法
done在promise的调用方法在链式调用的末端，保证then方法和catch方法未捕获的异常被done捕获
```javascript
MyPromise.done = function(onFulfilled, onRejected) {
    this.then(onFulfilled, onRejected).catch((err) => {
        setTimeout(() => {
            throw err
        });
    })
}
```

### any (es2021新增)
- 入参：数组，如果数组包含不是promise的对象，要将它转换为promise对象
- 返回值：promise对象，如果数组中有一个元素被resolved，那么返回值就是`fulfilled`，如果全部的元素都被`rejected`，那么返回值就被`rejected`
```javascript
MyPromise.prototype.any = function(promises) {
    // 边界条件判断1, 如果数组为空
    if (!promises.length) return Promise.resolve([])
    // 边界条件判断2，如果数组里包含不是promise的对象

    let _promises = promises.map(item => item instanceof Promise ? item : Promise.resolve(item))
    // 返回值判断，累计rejected次数决定返回值状态
    let rejetedTimes = 0
    // 保存每一个rejected的信息
    let errors = []
    // 满足返回值条件，必须是一个promise对象
    return new Promise((resolve, reject) => {
        _promises.forEach((promise, index) => {
        promise.then(value => {
                resolve(value)
            }, reason => {
                rejetedTimes += 1
                errors[index] = reason
                if(rejetedTimes === _promises.length) {
                reject(new AggregateError(
                    'No Promise in Promise.any was resolved', errors
                ))}
            })
        })
    })
}
```
### allSettled(es2020)
- 入参：数组，如果数组包含不是promise的对象，要将它转换为promise对象
- 返回值 `Promise`对象，value是一个数组
- 实现原理 `Promise.all`的进一步拓展，不管数组里的`Promise`是成功还是失败，都会返回<br/>
    在每一个then回调方法里判断是否是最后一个promise，如果是则返回
```javascript
MyPromise.prototype.allSettled = function(promises) {
    // 边界条件判断1, 如果数组为空
    if (promises.length === 0) return Promise.resolve([])
    // 边界条件判断2，如果数组里包含不是promise的对象
    let _promises = promises.map((item) => item instanceof Promise ? item : Promise.resolve(item))
    // 边界条件判断3，是否所有的promise都已经执行了then
    let unSettled = _promises.length
    // 满足返回值条件，必须是一个promise对象且value是promises的返回值数组
    return new Promise((resolve, rejected) => {
        _promises.forEach((promise, index) => {
            promise.then(((value) => {
                results[index] = {
                    value,
                    status: 'fulfilled'
                }
                unSettled = unSettled - 1
                if (unSettled === 0) resolve(results)
            }, reason => {
                results[index] = {
                    reason,
                    status: 'rejected'
                }
                unSettled = unSettled - 1
                if (unSettled === 0) resolve(results)
            }))
        })
    })
}
```
