# call、apply、bind实现原理

## call
给劫持的对象增加fn属性方法,通过context.fn方式调用函数改变this指向并返回运行结果
```js
Function.prototype._call = function(context) {
	if (typeof this !== 'function') return false
  context = context || window
  // 防止context不是引用类型，无法添加属性
  context = Object(context)
  // 防止给context添加属性出现命名冲突
  let fn = Symbol()
  let args = Array.from(arguments).slice(1)
  context[fn] = this
  let result = context[fn](...args)
  delete context[fn]
  return result
}
```

## apply
apply实现思路与call一致,但是需要将以数组结构的参数展开

```javascript
Function.prototype._apply = function(context, array) {
  if (typeof this !== 'function') return false
    context = context || window
    // 防止context不是引用类型，无法添加属性
    context = Object(context)
    // 防止给context添加属性出现命名冲突
    let fn = Symbol()
    context[fn] = this
    let result
    if (!array || array.length === 0) {
      result = context[fn]()
    } else {
      let args = Array.from(arguments).slice(1)
      result = context[fn](...args)
    }
    delete context[fn]
    return result
}
```

## bind
- 因为bind的使用方式是先绑定，后调用，所以返回值必须是一个函数
- bind的入参方式可以在绑定时传入，也可以在调用时传入，所以通过闭包的形式在返回的参数里访问到绑定时的入参并concat调用时的入参
- 绑定后的函数如果以new方式调用时，优先级高于bind，所以需要通过`instanceof`来判断函数的调用方式，如果是new操作符则改变`this`指向实例
```javascript
Function.prototype._bind = function(context) {
   if (typeof this !== 'function') return false
   context = context || window
   let that = this
   let boundArgs = Array.from(arguments).slice(1)
   let fn = function() {
		 let args = Array.from(arguments)
     // 如果是以new操作符调用，this指向实例，否则指向劫持者
     return that.apply(this instanceof that ? this : context, boundArgs.concat(args))
   }
   // 绑定的函数继承被绑定函数的原型
   fn.prototype = Object.create(that.prototype)
   return fn
}
```

