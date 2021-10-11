# async await

## async
异步处理函数，`generator`函数的语法糖

### 返回值
async函数的返回值是一个promise对象，所以可以使用promise的回调方法<br />

如果有抛出错误，则剩下的代码不会执行，
返回值：状态为rejected的promise对象，promise对象的值是抛出的错误

如果有显示返回值，剩下的代码也不会执行，
返回值：状态fulfilled为promise对象，promise对象的值就是返回的值

除了抛出错误和显示的return之外，只有等函数体内所有的await函数执行完毕，
返回值promise的状态才会改变，`async`函数才可以调用`then`方法

## await
await用来执行需要异步处理的函数，await命令后的代码会被注册到微任务队列（执行时机通过事件循环来决定）
### 返回值
如果await命令后是一个promise对象 返回它promise对象的值，注意不是返回promise对象，如果不是promise对象则返回值本身

### 返回值对async函数执行的影响
- 返回值是promise对象的情况，如果是resolve，剩下的代码仍然会注册到微任务执行；如果是rejected，不会执行
- 返回值是非promise对象，会返回该对象，剩下的代码也会注册到微任务执行

### 捕获错误
方法1：async标识的函数中用`catch`捕获<br />
方法2：await命令后面的函数用`catch`捕获<br />
这两种方式使用和`promise`捕获错误是相同的，如果想要await命令后的函数被`rejected`后仍然继续执行，可以使用`try{}catch(e){}`代码块包裹

### 多个await
当`async`函数中有多个`await`异步方法时，如果方法间不存在继发关系可以用以下写法 <br />
这样子写作用在于两个独立的请求函数可以同时进行
```javascript
    async getUserInfo() {
        let userName = getName()
        let userId = getId()
        await userName
        await userId
        return {userName, userId}
    }
```
也可以使用`Promise.all[]`来处理多个并发异步请求的问题

### 不要在forEach中使用async await
因为`forEach`的回调函数会变为普通函数

### 与generator的区别
generator函数必须通过任务执行器（可以理解为generator函数的返回值）调用执行，<br/>
或者遍历generator调用执行，而async可以自动执行

### 与Promise的区别
在代码结构上，`async`会比`promise`函数更加清晰

## async实现原理
async的generator的语法糖，区别只在于async可以自动执行，<br/>
不需要像generator一样调用任务执行器，<br/>
所以只需要实现一个generator的自动执行器，<br/>
就可以实现`async`

### 自动执行器的实现思路
1. 返回一个promise对象，因为`async`函数的返回值就是promise对象
```javascript
function spawn(genF) {
    return new Promise((resolve, reject) => {})
}
```
2. 获取`generator`函数的任务运行器，<br/>
`spawn`的入参`genF`就是`generator`函数
```javascript
function spawn(genF) {
    return new Promise((resolve, reject) => {
        const gen = genF()
    }) 
}
```

3. 创建一个递归函数`step`，自动调用任务执行器的核心;
```javascript
function(nextFn) {
    // next缓存每次gen.next()的返回值 
    let next;
    try {
        next = nextFn()
    } catch(e) {
        // 运行报错，async函数的返回值直接被rejected
        return reject(e)
    }
    // yield已经全部执行完毕,async函数的返回值被resolved
    if (next.done) {
        return resolve(next.value)
    }
    // 继续执行剩下的yield
    Promise.resolve(next.value).then(
        (value) => {
            // value返回值被resolve
            gen.next(value)
        }, err => {
            gen.throw(e)
        }
    )
}
```
4. 运行递归函数`step`，实现自动运行
```javascript
    function spawn(genF) {
        return new Promise((resolve, rejected) => {
            // ...忽略部分代码
            function step(nextFn) {}
            // 因为第一次调用next的参数无效，所以传undefined
            step(() => gen.next(undefined))
        })
    }
```

5. 完整代码
```javascript
async function fn() {}

// 等同于
function fn() {
    return spawn(function* () {})
}
function spawn(genF) {
    return new Promise((resolve, reject) => {
        // 2.1 获取任务执行器
        const gen = getF()
        function step(nextF) {
            let next;
            try {
                next = nextF()
            } catch(e) {
                return rejected(e)
            }
            // 已经全部执行了yield表达式
            if (next.done) {
                return resolve(next.value)
            }
            Promise.resolve(next.value).then(function(v) {
                step(function() {
                    return gen.next(v)
                })
            }, function(e) {
                step(function() {
                    return gen.throw(v)
                })
            })
        }
        step(function() {return gen.next(undefined)})
    })
}
```