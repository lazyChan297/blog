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

### ES5构造函数继承
本质上是通过call调用父类的构造方法,缺点是不能继承父类的原型方法
```javascript
function Parent(name) {this.name = name}
function Child(name) { Parent.call(this, name) }
let babe = new Child('babe')
```
### 原型链继承
将子类的prototype赋值为父类的prototype，缺点是不能继承父类的构造方法
```javascript
function Parent(name) {this.name = name}
Parent.prototype.sayHi = function() {
    console.log(`hi, i am ${this.name}`)
}
function Child(name) { this.name = name }
Child.prototype = Parent.prototype
let babe = new Child('babe')
babe.sayHi()
```

### 构造-原型组合继承
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
### ES6继承
通过class声明类，通过extends关键字实现继承
但是有几点需要注意
1. 通过class声明的类不存在变量提升
2. class声明的类只能以new关键字调用，es5的构造函数则可以当作普通函数使用
3. 继承class声明的类的方法用super(),并且要在this前
4. 使用class声明的类里的方法都是不可枚举的
5. class声明的静态属性只有类和继承类可以调用，实例不行

### ES6的底层实现原理
class的babel
首先通过instaceof判断是否为new操作符调用，因为class不允许以普通函数调用；
接着，如果class里有定义方法使用Object.defineProperty将方法定义到对象的prototype中
如果是static方法或属性同样使用Object.defineProperty将方法定义到对象中，注意不是prototype；
当创建子类继承父类时，同样先判断是否new操作符调用，接着执行继承函数_inherits，
_inherits负责将子类的prototype创建一个空对象并赋值父类的prototype，子类的__proto__指向父类构造函数
然后，执行子类的构造方法就是constructor内容和super关键字继承部分
_possibleConstructorReturn是super继承部分，逻辑是子类的实例通过call劫持，调用了子类的__proto__，也就是父类的构造函数，
接着，返回实例，子类的构造函数执行完毕

```javascript
// es6
constructor(a){
    this.filed1 = a;
  }
  filed2 = 2;
  func1 = function(){}
// babel转换为es5
function _classCallCheck(instance, Constructor) {
　// instanceof 检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
var Parent = function Parent(a) {
  _classCallCheck(this, Parent);

  this.filed2 = 2;

  this.func1 = function () { };

  this.filed1 = a;
};
```
继承的babel
```javascript
class Child extends Parent {
  constructor(a,b) {
    super(a);
    this.filed3 = b;
  }
  filed4 = 1;
  func2 = function(){}
}

// 转换后
var Child = function (_Parent) {
  _inherits(Child, _Parent);

  function Child(a, b) {
    _classCallCheck(this, Child);
    // 实例通过call调用子类的__proto__ 也就是父类的构造函数,实现super
    var _this = _possibleConstructorReturn(this, (Child.__proto__ || Object.getPrototypeOf(Child)).call(this, a));

    _this.filed4 = 1;

    _this.func2 = function () {};

    _this.filed3 = b;
    return _this;
  }

  return Child;
}(Parent);

function _inherits(subClass, superClass) {
  // 对父类构造函数进行类型判断
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  // 与寄生继承一致，用父类的构造函数原型创建一个新对象，赋值给子类的prototype，并把子类的constructor指向子类本身
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, enumerable: false, writable: true, configurable: true }
  });
  if (superClass)
    // 设置子类的__proto__指向父亲构造函数
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
```
