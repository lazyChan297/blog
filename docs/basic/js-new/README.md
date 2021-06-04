# new操作符

## new操作符执行过程
### 返回值
1. 如果定义了`return`且返回值是引用类型，那么new操作符返回的就是该对象
2. 如果定义了`return`且返回值是基本类型，那么会返回一个该构造函数的实例
3. 如果没有定义`return`，自动返回该构造函数的实例

### prototype指向
将返回的对象的`[[prototype]]`指向构造函数的`prototype`

### this指向
执行构造函数过程中，this指向的是返回的实例

## 手写new操作符
```javascript
function newFn(context) {
    if (typeof context !== 'function') {
        return new TypeError('')
    }
    newFn.target = context
    // 实现实例的[[prototype]]与构造函数的prototype关联
    let obj = Object.create(context.prototype)
    let args = Array.from(arguments).slice()
    let result = context.apply(obj, args)
    if (Object.prototype.toString.call(result) === '[object Object]' || typeof result === 'function') {
        return result
    } else {
        return obj
    }
}
```