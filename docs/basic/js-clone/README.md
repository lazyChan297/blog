# 深浅拷贝

## 浅拷贝
拷贝的是引用类型的内存地址的指针，拷贝的值与被拷贝的值指向的是同一堆内存，两个值之间会互相影响
**实现方式**
对象的浅拷贝
  - `Object.assign()`
  - `{...object}`
数组的浅拷贝
- `slice()`
- `concat()`

或者自己写一个函数遍历
```javascript
function shallowClone(obj) {
  let target
  for (let key of obj) {
    target[key] = obj[key]
  }
  return target
}
```

## 深拷贝
拷贝的是值本身，拷贝的对象和被拷贝对象指向的不是同一堆内存，两个值之间互相独立但是值却完全相等

**实现方式**
### `JSON.parse(JSON.stringify(obj))`
如果已知数据结构没有`undefined`、`循环引用`、`Symbol类型`、`function`则可以使用`JSON.parse(JSON.stringify(obj))`
这种方式非常简单便捷，但是缺点也就是不能实现以上的类型拷贝

### DeepClone
实现一个深拷贝函数，满足以下条件
- 满足symbol类型的拷贝
- 支持循环引用的对象
- 支持函数序列化
- 如果是基本类型则直接返回值

```javascript
function DeepClone(obj, map = new Map()) {
  const isFunction = (o) => typeof o === 'function' && o !== null
  const isObject = (o) => typeof o === 'object'
  const isArray = (array) => Array.isArray(array)
  // 非引用类型直接返回值
  if (!isObject && !isArray && !isFunction) return obj
  // 如果已经对该key拷贝直接返回，使用map来防止循环引用
  if (map.get(obj)) return map.get(obj)
  // 返回一个新的内存对象
  let target = isArray(obj)? [] : {...obj}
  // 当前对象没有被拷贝过，所以保存到key中
  map.set(data, target)
  // Reflect.ownKeys可以把symbol属性遍历
  Reflect.ownKeys(target).foEach(key => {
    target[key] = isFunction(target[key]) ? target[key] : isObject(target[key]) ? DeepClone(target[key]) : target[key]
  })
  return target
}
```

