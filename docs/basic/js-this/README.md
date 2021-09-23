# this

## 普通函数中的this
如果是非严格模式，this指向window
如果是严格模式，this指向undefined
如果该普通函数被别的对象调用，那么谁调用该函数，谁就是this

## new操作符的this
new操作符的this永远指向它创建的实例

## call、bind、apply中的this
永远指向被它劫持的对象

## 箭头函数的this
箭头函数的this指向包裹它最外层的函数的this，取决于定义时它的this是谁，而不是调用时它的this是谁

## 举个例子
```javascript
var name = 'window'
function Person (name) {
  this.name = name;
  this.show1 = function () {
    console.log(this.name)
  }
  this.show2 = () => console.log(this.name)
  this.show3 = function () {
    return function () {
      console.log(this.name)
    }
  }
  this.show4 = function () {
    return () => console.log(this.name)
  }
}
var personA = new Person('personA')
var personB = new Person('personB')
```

### 实例里的普通函数调用
`personA.show1()`
谁调用了它 谁就是this 所以输出personA

`personA.show3()()`
分两步，第一步`personA.show3()`返回了一个函数在全局作用域
在全局作用域内调用了返回的函数所以this.name 为window or undefined


### 显示绑定this
`personA.show1.call(personB)`
谁劫持了它（显示绑定）谁就是this 所以输出personB

`personA.show3().call(personB)`
分两步，第一步`personA.show3()`返回了普通函数
第二步，personB通过`call`劫持了它，所以输出personB

`personA.show3.call(personB)()`
这一句具有迷惑性，虽然personB劫持了personA.show3这一变量的this
但是返回的函数仍然在全局作用域中调用
所以 输出window or undefined

### 箭头函数中的this
`personA.show2()`
`show2`是箭头函数，定义时包裹它最外层的普通函数`this`指向当前的实例
所以输出personA

`personA.show2.call(personB) `
和上一行原理相同，箭头函数`this`由定义它时`this`决定而不是调用时或者被显示绑定而改变
所以 输出personA

`personA.show4()()`
分两步，`personA.show4()`返回了一个箭头函数，此时返回的函数`this`已经定义为personA
第二步，在全局作用域中执行，但是箭头函数的`this`不会改变
所以 输出personA

`personA.show4().call(personB)`
分两步，`personA.show4()`先执行，此时已经定义了箭头函数，`this`为personA
第二步，personB劫持返回函数的this无效
所以 输出personA

`personA.show4.call(personB)()`
分两步，personB劫持了`personA.show4`执行，注意是劫持后再执行定义了箭头函数
所以this执行personB
第二步，劫持函数后执行返回了箭头函数在全局作用域中调用，所以this无法被改变执行
所以 输出personB