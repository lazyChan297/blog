# async await

## async
异步处理函数，`generator`函数的语法糖



### 返回值
async函数的返回值是一个promise对象，所以可以使用promise的回调方法<br />

如果有抛出错误，则剩下的代码不会执行，<br />
返回值：promise对象，状态rejected，promise对象的值是抛出的错误

如果有返回值，剩下的代码也不会执行，<br />
返回值：promise对象，状态fulfilled，promise对象的值是返回的值<br />

除了抛出错误和显示的return之外，只有等函数体内所有的await函数执行完毕，<br />
返回值promise的状态才会改变，`async`函数才可以调用`then`方法

## await
await方法通常用来执行需要异步处理的函数，await命令后的代码会被注册到微任务队列（执行时机通过事件循环来决定）

### 返回值
如果await命令后是一个promise对象 返回它promise对象的值（注意不是返回promise对象）<br />
如果不是则返回值本身

### 返回值对async函数执行的影响
- 返回值是promise对象的情况，如果是resolve，剩下的代码仍然会注册到微任务执行；如果是rejected，不会执行
- 返回值是非promise对象，会返回该对象，剩下的代码也会注册到微任务执行

### 捕获错误
方法1：async标识的函数中用`catch`捕获<br />
方法2：await命令后面的函数用`catch`捕获<br />
这两种方式使用和`promise`捕获错误是相同的<br />
如果想要await命令后的函数被`rejected`后仍然继续执行，可以使用`try{}catch(e){}`代码块包裹

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

### 与Promise的区别