# 原型、原型链、继承

## 原型
### 实例的[[prototype]]
每一个对象都有__proto__指针，实例作为一个对象，也拥有__proto__指针，指向它的构造函数的prototype
```javascript
function F() {}
let f = new F()
f.__proto__ === F.prototype // true
```

### 构造函数prototype
每一个函数会拥有prototype，构造函数自然也会拥有prototype，注意不是__proto__，<br/>
prototype可以理解指向该函数的一块空间内存（对象），里面保存了它的构造函数、空间内存（对象）自身的_proto_，<br/>
同时这一块空间内存可以继续添加属性和方法，方便函数和函数的实例通过原型链调用

```javascript
function F() {}
F.prototype.constructor === F //true
F.prototype.__proto__ === Object.prototype
// Object.prototype是所有原型对象的顶点所以不再存在__proto__
Object.prototype.__proto__ === null // true
```

## 原型链

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

**`instanceof`关键字判断的是左边值的__proto__是指向右边值的prototype中，如果不是指向右边的值的prototype则会继续寻找右边值的prototype的__proto__**
- `Object instanceof Object` 等于`true`
  - 因为Object本身是一个函数所以`Object.__proto__ === Function.prototype // true` 
  - 而函数的原型对象的隐式原型又指向`Object.prototype`，`Function.prototype.__proto__ === Object.prototype//true`
- `Function instanceof Function`等于`true`，因为`Function.__proto__ === Function.prototype`等于true
- `Function instanceof Object`，因为`Function.prototype.__proto__ === Object.prototype`等于true
## 继承
### ES5实现继承

#### 构造函数继承
本质上是通过call调用父类的构造方法,缺点是不能继承父类的原型方法
```javascript
function Parent(name) {this.name = name}
function Child(name) { Parent.call(this, name) }
let babe = new Child('babe')
```
#### 原型链继承
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

#### 构造原型组合继承
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
### ES6实现继承
非常简单，直接使用`extends`关键字，如果想要继承父类的实现构造方案，调用`super`函数。
需要注意的是，必须在使用`super`后才能使用this指针

### class与构造函数的差异
- 通过class声明的类不存在变量提升
- class声明的类只能以new关键字调用，es5的构造函数则可以当作普通函数使用
- 继承class声明的类的方法用super(),并且要在this前
- 使用class声明的类里的方法都是不可枚举的
- class声明的静态属性只有类和继承类可以调用，实例不行

### ES6实现继承的原理
- class定义的函数不能被new操作符以外的方式调用，所以实现一个`_classCallCheck`函数实现new操作符检查
```javascript
function _classCallCheck(instance, Constructor) {
  　// instanceof 检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
```

**实现父类原型对象部分的基础**
 - 通过`Object.create()`将父类的原型对象赋值给子类的原型对象且子类的constructor要指向它自己
 - 因为class是不可枚举的，所以`enumerable`要设置为false
 - 把子类的隐式原型指向父类的构造函数，方便接下来的super继承
```javascript
function _inherits(subClass, superClass) {
    // 对父类构造函数进行类型判断
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    // prototype部分继承
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      // 子类的constructor指向子类本身
      constructor: { 
        value: subClass, 
        enumerable: false, // 因为构造函数是不可以枚举的，所以enumerable为false
        writable: true, 
        configurable: true 
      }
    });
    if (superClass)
      // 设置子类的__proto__指向父亲构造函数
      Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }
```
- 实现构造函数部分继承super，让子类的实例通过apply劫持父类构造函数，返回一个新的对象
再基于该对象添加子类自己的实例方法和属性<br/>
个人理解，如果先给子类的实例添加了子类的实例方法和属性再调用父类的，那么子类的属性就会被覆盖
```javascript
  function _createSuper(Derived) { 
    return function () { 
      var Super = Derived.__proto__, result; 
      result = Super.apply(this, arguments)
      return _possibleConstructorReturn(this, result)
    }
  }
  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError('this..')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
  }
```

