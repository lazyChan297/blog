# 作用域

## 块级作用域
块级作用域内定义的变量不可以被外部访问和修改 <br />
创建块级作用域的方式是通过`let` 或者 `const`声明变量 <br />
块级作用域的作用是`var`声明的变量会有变量提升，从而暴露变量被意外修改的风险 <br/>
**such as**
```javascript
var name = '张三'
function() {
    console.log(name) // undefined
    if (false) {
        var name = '李四'
    }
}
```
## try catch的作用域
要分两种状况讨论
- 如果在`try catch`代码块中声明的变量与catch的参数相同，可以理解为该变量提供了一个块级作用域
如果是`var`声明，那么该变量会提升在`try catch`代码块的顶部，在该作用域外是访问不到的<br/>,
类似 `let` 声明的变量
```javascript
try {
    console.log(err) // err提升到try顶部， undefined
    x // 故意抛出一个错误
} catch(err) {
    var err;
    console.log(err)
}
```
- 如果声明的是其他变量，`try catch`代码块是不会开辟一个新的作用域的，不要被它的花括号迷惑 <br />
它和包含它的外部环境在同一作用域

```javascript
var a = 'hello'
try {
    throw new Error('')
} catch(e) {
    console.log(a) // hello, try代码块与第一个var a 是同一作用域
    var a;
}
```

```javascript
try { 
    var a = 'hello'
} catch(e) {
    var a = 'world'
}
console.log(a) // world，在try内声明的变量外部也可以访问，证明作用域无效
```