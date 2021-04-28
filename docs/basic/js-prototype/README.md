# 原型与原型链继承

## 实例的[[prototype]]

```javascript
// 实例作为一个对象，拥有__proto__指针 指向它的构造函数的prototype
function F() {}
let f = new F()
f.__proto__ === F.prototype // true
```

## 构造函数prototype

```javascript
// 构造函数自身会拥有prototype指针
// prototype可以理解指向该函数单独的一块空间内存（对象），里面保存了它的构造函数，空间内存自己的_proto_ 同时这一块空间内存可以继续添加属性和方法，方便函数和函数的实例通过原型链调用
function F() {}
F.prototype.constructor === F //true
F.prototype.__proto__ === Object.prototype
// Object.prototype是所有原型对象的顶点所以不再存在__proto__
Object.prototype.__proto__ === null // true
```

## 原型链的形成

```javascript
function F() {}
F.prototype.a = function() {}
let f = new F()
// f 通过__proto__ 指向了 F.protype 调用a方法
f.a()
```

## 继承

原型链部分的继承的目的在于让子类的实例能够调用父类的prototype属性和方法

假设有一个父类P，子类C继承P，c1是C的实例，c1能调用P的方法

本质上则是`c1.__proto__`指向了`C.prototype`，而`C.Prototype.__proto__` 又指向了`P.prototype`

所以 `c1.__proto__.__proto__`指向了`P`的原型对象，实现原型链继承

```javascript
function Super(name) {
  this.name = name
}

Super.prototype.sayName = function() {
  return this.name
}

function Sub(name) {
  // 继承构造函数部分
  Super.call(this, name)
}
// 继承原型部分
// 如果将Super.prototype直接赋值给Sub.prototype,那么Super和Sub的prototype指向的则是同一块堆内存，存在互相影响的问题
Sub.prototype = Object.create(Super.prototype)
// 因为Sub.prototype已经被重写，原来的constructor需要重新赋值
Sub.prototype.constructor = Sub
```

