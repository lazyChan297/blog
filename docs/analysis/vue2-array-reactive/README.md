# vue2监听数组的变化的实现原理

**由于`Object.defineProperty`的限制，无法监听数组的变化，但是可以通过劫持部分数组的原型方法实现响应**

### 实现原理
1. 劫持了对数组本身发生变化的7个方法`splice` `push` `pop` `unshift` `shift` `sort` `reverse`
2. 通过`Object.defineProperty` 重写以上方法的value，通过`mutator`方法返回；
3. `mutator`方法执行的过程中会派发更新，如果有新元素增加则将新增的元素observe(变为响应式对象，实现监听)

1. 新增一个对象继承数组的原型链并隔绝，`var arrayProto = Array.prototype;` `var arrayMethods = Object.create(arrayProto)`<br/>
主要对数组本身会发生变化的7个方法进行拦截，`splice` `push` `pop` `unshift` `shift` `sort` `reverse`
2. 即通过一个函数`mutator`返回通过`Object.defineProperty`对以上7个方法拦截，修改要传入的`value`
3. `mutator`先通过获取`arguments`和`apply`劫持了原生的方法的`this`调用，这样便可以获得更新后的数组
4. `mutator`再通过是否调用了`splice`,`push`、`unshift`中其中一个，判断是否有新增元素，如果有为新增的元素实现响应式
5. 接着派发更新，和其他响应式对象的派发更新一样
### 实现源码
```javascript
// vue 源码部分
// 缓存array所有的原型方法
var arrayProto = Array.prototype;
// 继承array所有的原型方法并隔绝
var arrayMethods = Object.create(arrayProto)
// 会改变数组本身的方法
var methodsToPatch = ['push','pop','shift','unshift','splice','sort','reverse']
methodsToPatch.forEach(function(method) {
// Array.prototype原型方法
var origin = arrayProto[method]
  // def调用Object.definePrototy 将value 重写成了mutator方法，调用以上七个方法时触发mutator
  def(arrayMethods, method, function mutator() {
    var args = [], len = arguments.length
    while(len-- ) arg[len] = arguments[len]
    // result作为新数组返回
    var result = origin.apply(this, args)
    var ob = this.__ob__;
    // 是否有新增元素
    var inserted;
    switch(method) {
      case 'push':
      case 'unshift':
        inserted = args // 新增的元素
        break;
      case 'splice':
        inserted = args.slice(2) // splice存在新增&删除的可能,所以取第二个元素
        break;
    }
    if (inserted) ob.observeArray(inserted)
    ob.dep.notify() // 派发更新
    return result
  })
})

export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}
```