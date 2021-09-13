# generator
异步编程解决方案之一

## 使用方法
`function* gen(){}` 用*表示该函数是generator函数

### generator的返回值
`let g = function* gen(){}`
可以理解为g是一个generator类型的实例 <br/>
因为g的原型对象指向Generator<br/>
后续控制函数的执行则交由`generator`函数返回的值，也就是`g`

### yield
控制函数执行暂停的表达式<br />
当函数体内遇到`yield`表达式时，后续的代码会暂停执行
- 返回值
`yield`返回的数据结构 {value, done} <br/>
value是表达式后的函数返回的值or变量值本身<br />
done是布尔值 表示是否函数体内的yield执行完毕

### next
`generator`函数返回的对象具备`next`方法，该方法作用是控制yield执行<br/>
第n次调用对应函数体内的第n个`yield`，<br/>
第大于n+1次执行`next`，会返回value是undefined，done是true的对象

#### next传参
传参代替的是上一次`yield`表达式返回的值，<br/>
首先声明，第一次调用next传参数是被浏览器引擎忽略的<br />
such as <br/>
```javascript
    function* sum(x) {
        var y = 2 * yield(x + 1)
        var z = yield(y / 3)
        return x + y + z
    }
    var s = sum(5)
```
`s.next()` <br/>
第一个yield执行，5 + 1 = 6，返回`{value: 6,done:false}` <br/>
`s.next()` <br/>
第二个yield执行，next参数为空，所以上一个yield`yield(x+1)`为`undefined`<br/>
返回值是 `{value: 2*undefined,done:false}` <br/>
`s.next()` <br/>
第三次调用next，yield已经执行完毕，执行剩下的代码并把done标记为false，<br/>
传入的参数也为空，所以返回值是`{value: undefined + NaN + 5, done:true}`
如果有return 就返回return的值<br/>
否则返回值是undefined




