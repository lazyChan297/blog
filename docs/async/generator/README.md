# Generator
异步编程解决方案之一

## 使用
**声明** `function* gen(){}` 用*表示该函数是generator函数

**返回值** 是一个遍历器对象，该对象具备以下三个方法
1. **next(v)** 执行第N个`yield`表达式，传入的参数替代上一个`yield`表达式返回的值
2. **throw(error)** 可以在`generator`函数抛出错误，在`generator`函数内部用`try catch`代码块捕获
3. **return(v)** 终结`generator`函数的遍历，传入的值就是返回对象中value的值，`done`属性会变为`true`，此后再调用`next`方法返回值都是已结束状态的返回值

**yield表达式** 控制函数执行暂停的表达式，当函数体内遇到`yield`表达式时，后续的代码会暂停执行
**yield表达式的返回值** 数据结构 `{value, done}`，value是表达式后的函数返回的值or变量值本身；done是布尔值 表示是否函数体内的yield执行完毕

**next** `generator`函数返回的对象具备`next`方法，该方法作用是把`yield`表达式替换成一个`next(value)`传入的参数，如果没有则替换成undefined。
- 第n次调用对应函数体内的第n个`yield`
- 第大于n+1次执行`next`，会返回value是undefined，done是true的对象

**传参** 因为`next`传入的参数是代替上一次`yield`表达式返回的值，所以第一次调用`next`时是被浏览器忽略的，因为此前并没有`yield`表达式执行

使用一个例子来说明
```javascript
    function* sum(x) {
        var y = 2 * yield(x + 1)
        var z = yield(y / 3)
        return x + y + z
    }
    var s = sum(5)
    s.next() // {value: 5+1, done: false}
    s.next() // 因为next参数为空，所以上一个yield表达式x+1的返回值y为undefined/3 = NaN, {value: undefined/3, done: false}, 
    s.next() // 因为next参数为空，所以上一个yield表达式x+1的返回值z为undefined+NaN+x, {value: undefined+NaN+x, done: true}
```

**this指向** 因为`generator`函数的返回值总是它的遍历器对象，如果把返回值当成普通函数调用时要注意this是指向不到遍历器对象的

**遍历执行** 可以使用`for.of.`自动执行遍历器，因为该函数返回值具有`Iterator`接口，这样就不需要调用next方法，当`done`属性变为true时会自行停止，`for.of`后面的代码不会再执行


