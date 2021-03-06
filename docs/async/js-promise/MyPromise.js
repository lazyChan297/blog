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

// catch方法
MyPromise.prototype.catch = function(onRejected) {
    this.then(null, onRejected)
}

// resolved 返回值是fulfilled状态的promise对象
MyPromise.resolve = function(value) {
    return new MyPromise((resolve) => {
        resolve(value)
    })
}

// rejected 返回值是rejected状态的promise对象
MyPromise.reject = function(reason) {
    return new MyPromise((resolve, reject) => {
        reject(reason)
    })
}

// race
// 接收promises对象数组，返回promises对象；只要有一个promise被resolved,返回值的状态就是fulfilled的
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

// all
// 接收promises对象数组；如果所有的promise对象被resolved，resolve的参数是所有promise对象的结果数组，promise对象的状态是fulfilled；
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

// allSettled
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

// done在promise的调用方法在链式调用的末端，保证then方法和catch方法未捕获的异常被done捕获
MyPromise.done = function(onFulfilled, onRejected) {
    this.then(onFulfilled, onRejected).catch((err) => {
        setTimeout(() => {
            throw err
        });
    })
}

// finally 接收一个函数作为参数，不论promise的状态是什么最终都会执行
MyPromise.prototype.finally = function(callback) {
    // 缓存MyPromise的构造方法，使用MyPromise.resolve和MyPromise.reject把callback的执行结果变为具备then方法的对象并调用then方法
    const c = this.constructor
    return this.then(
        value => {
            c.resolve(callback()).then(() => value)
        },
        reason => {
            c.reject(callback()).then(() => {throw reason})
        }
    )
}

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