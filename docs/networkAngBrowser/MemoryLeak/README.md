# 内存泄漏


## 什么是内存泄漏
::: tip 定义
虽然引擎有垃圾回收机制，但是仍然不可避免会出现，当一个对象不再被引用，但是却没有被回收，这就是内存泄漏
:::

## 常见场景
### 不正当使用闭包
注意，是**不正当**使用闭包才会造成内存泄漏，假如通过某闭包可以访问的内部变量一直被使用，那就不能称之为内存泄漏 <br/>
或者闭包返回的函数并没有访问包裹它的函数的变量，所以当执行完包裹他的函数时里面的局部变量就会被销毁

such as
```javascript
function fn() {
    var name = 'unknow'
    return function() {
        return name
    }
}
let closure = fn()
closure() // name一直存活在内存中，不会被回收
closure = null // 当逻辑判断已经明确不再需要name时，手动清除该内存
```

### 隐式全局变量
众所周知，当一个函数离开执行栈，函数内的局部变量会被销毁（也就是被垃圾回收），
但是对于全局变量来说是一直活动在全局作用域中的，垃圾回收机制很难判断它是否不再被使用

**不小心创建隐式全局变量的方式**
1. 声明局部变量时没有用`var`或者`let`或者`const`，所以该变量会被挂载到全局作用域中
```javascript
function fn() {
    name = 'unknow'
}
fn()
```
2. 在普通函数中使用了`this`，因为`fn`并不是以构造函数的方式使用，所以`this`会被指向`window`，而`age`也会被挂载到window上
```javascript
function fn() {
    this.age = 100
}
fn()
```

### 游离DOM引用
出于业务需求会使用变量来保存一下`dom`结构，例如
```html
<div id="div">
    <ul id="ul">
        <li></li>
        <li id="li"></li>
        <li></li>
    </ul>
</div>
```
```javascript
let div = document.querySelector('#div')
let ul = document.querySelector('#ul')
let li = document.querySelector('#li')
div.removeChild(ul)
```
这样会导致内存泄漏，因为虽然在`dom`中清空了子节点，但是子节点仍然缓存在父节点的变量里，所以必须把子节点全部置空
`ul = null`,`li = null`，才可以使垃圾回收机制检测到

### 遗忘的定时器、事件监听、监听者模式
这三种情况原理都一致，如果被遗忘清除监听的话，那么回调函数里的变量就会被认为一直存活，无法被垃圾回收机制检测

### 遗忘的Map和Set对象

#### 强弱引用
我理解的强引用是日常开发的对引用类型的赋值都是强引用，例如
```javascript
let person = {name: 'someone'}
let another = {man: person}
person = null
another.man // {name: 'someone'}

// 在map中
let a = [1,2,3]
let map = new Map()
map.set(a, 1)
a = null // map里的key值的内存并不会被回收，
console.log(map) // [1,2,3]: 0
```
目前js中出现弱引用的情况只有`weakMap`和`weakSet`，弱引用就是会被垃圾回收机制检测到的，例如
```javascript
let a = [1,2,3]
let map = new WeakMap()
map.set(a, 0)
a = null
map.has(a) // false, 当a被清空时，弱引用的key值被垃圾回收机制检测一起清空了
```
