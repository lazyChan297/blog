# 原型与原型链继承

## 实例的[[prototype]]
实例作为一个对象，拥有__proto__指针 指向它的构造函数的prototype
```javascript
function F() {}
let f = new F()
f.__proto__ === F.prototype // true
```

## 构造函数prototype
构造函数自身会拥有prototype指针，注意不是[[prototype]]
prototype可以理解指向该函数单独的一块空间内存（对象），里面保存了它的构造函数、空间内存自己的_proto_，同时这一块空间内存可以继续添加属性和方法，方便函数和函数的实例通过原型链调用
```javascript
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

原型链部分的继承的目的在于让子类的实例能够调用父类的prototype属性和方法

假设有一个父类P，子类C继承P，c1是C的实例，c1能调用P的方法

本质上则是`c1.__proto__`指向了`C.prototype`，而`C.Prototype.__proto__` 又指向了`P.prototype`

所以 `c1.__proto__.__proto__`指向了`P`的原型对象，实现原型链继承

## ES5实现

### 构造函数继承
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

### ES5构造-原型组合寄生继承
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
## ES6实现
非常简单，直接使用`extends`关键字，如果想要继承父类的实现构造方案，调用`super`函数。
需要注意的是，必须在使用`super`后才能使用this指针

### 实现原理
#### es6代码
```javascript
  class Parent {
    constructor(a) {
      this.filed1 = a
      this.filed2 = 2
      this.func1 = function () { };
    }
  }
  class Child extends Parent {
    constructor(a,b) {
      super(a);
      this.filed3 = b;
    }
    filed4 = 1;
    func2 = function(){}
  }
```

#### 通过babel转换后的代码
```javascript
  // ======= extends api编译部分
  /** 
   * _classCallCheck 判断该函数是否是new调用，因为class定义的类只能以new操作符调用，不能以普通函数调用
   * instance 实例
   * Constructor 构造函数
   * 利用instanceof判断当前的实例是否在构造函数的原型上
  */
  function _classCallCheck(instance, Constructor) {
  　// instanceof 检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  /**
   * _possibleConstructorReturn 子类继承父类的构造函数部分的实现
   * self 子类的实例
   * call 子类构造函数的__proto__ 也就是父类的构造函数
   * return 父类的构造方法or子类实例本身
   * */
  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError('this..')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
  }
  /**
   * _inherits 继承的具体实现，包含了constructor部分和原型部分
   * subClass 子类
   * superClass 父类
  */
  function _inherits(subClass, superClass) {
    // 对父类构造函数进行类型判断
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    // prototype部分继承实现
    // 用父类的构造函数prototype创建一个新对象，赋值给子类的prototype，并把子类的constructor指向子类本身，因为构造函数是不可以枚举的，所以enumerable为false
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: { value: subClass, enumerable: false, writable: true, configurable: true }
    });
    if (superClass)
      // 设置子类的__proto__指向父亲构造函数
      Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }


  // ======= demo代码的编译部分
  // 父类的实现
  var Parent = function Parent(a) {
    // 是否为new操作符调用检查
    _classCallCheck(this, Parent);
    this.filed2 = 2;
    this.func1 = function () { };
    this.filed1 = a;
  };
  // 子类的实现
  var Child = function (_Parent) {
    // 实现继承
    _inherits(Child, _Parent);
    function Child(a, b) {
      // 是否为new操作符调用检查
      _classCallCheck(this, Child);
      // super部分继承实现
      // 实例通过call调用子类的__proto__ 也就是父类的构造函数,并将this绑定为自身
      var _this = _possibleConstructorReturn(this, (Child.__proto__ || Object.getPrototypeOf(Child)).call(this, a));
      // 其他属性方法的实现
      _this.filed4 = 1;
      _this.func2 = function () {};
      _this.filed3 = b;
      return _this;
    }
    return Child;
  }(Parent);
```
#### 逻辑
##### new操作符调用检查
  定义一个class时， 首先会执行`_classCallCheck`, 本质是通过instaceof判断是否为new操作符调用，因为class不允许以普通函数调用；
##### 属性方法的实现
如果class里有定义方法使用Object.defineProperty将方法定义到对象的prototype中
如果是static方法或属性同样使用Object.defineProperty将方法定义到**对象**中，注意不是prototype；
##### 继承
当创建子类继承父类时，同样先判断是否new操作符调用
##### 原型继承
执行继承函数`_inherits`，`_inherits`负责将子类的prototype创建一个空对象并赋值父类的prototype，子类的__proto__指向父类构造函数
##### super继承
执行子类的构造方法``_possibleConstructorReturn``，也就是constructor内容和super关键字继承部分，
逻辑是子类的实例通过call劫持了父类的构造函数，调用了子类的__proto__，也就是父类的构造函数，
接着，返回实例，子类的构造函数执行完毕

## ES6继承与ES5继承的差异
1. 通过class声明的类不存在变量提升
2. class声明的类只能以new关键字调用，es5的构造函数则可以当作普通函数使用
3. 继承class声明的类的方法用super(),并且要在this前
4. 使用class声明的类里的方法都是不可枚举的
5. class声明的静态属性只有类和继承类可以调用，实例不行