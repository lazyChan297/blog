# 深浅拷贝与比较

## 浅拷贝
拷贝的是引用类型的内存地址的指针，拷贝的值与被拷贝的值指向的是同一堆内存，两个值之间会互相影响

**实现方式**

对象
  - `Object.assign()`
  - `{...object}`

数组
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

### `JSON.parse(JSON.stringify(obj))`
如果已知数据结构没有`undefined`、`循环引用`、`Symbol类型`、`function`则可以使用这种方式，非常简单便捷，但是缺点也就是不能实现以上的类型拷贝

### DeepClone
实现一个深拷贝函数，满足以下条件<br/>
- 满足symbol类型的拷贝
- 支持循环引用的对象
- 支持函数序列化
- 如果是基本类型则直接返回值<br/>
实现逐层拷贝的思路是使用递归，只要不是基本类型，继续递归

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
    target[key] = isFunction(target[key]) ? target[key] : isObject(target[key]) ? DeepClone(target[key], map) : target[key]
  })
  return target
}
```
可以通过这个链接测试函数是否成功
[手写cloneDeep()](https://bigfrontend.dev/zh/problem/create-cloneDeep)

## 浅比较
浅比较的底层原理和浅拷贝相同，比较的是引用地址是否相同

## 深比较
深比较的底层原理和深拷贝相同，比较的是内存而不是内存地址<br/>
实现逐层比较的思路依旧是使用递归，条件是只要是对象就一直往下递归

### isEqual
实现一个深拷贝的函数，满足以下几点
- 如果是基本类型直接严格比较
- 支持循环引用对象的比较
- 如果是Object或数组要满足他们的值的比较而不是内存地址



```javascript
function isEqual(a, b, map = new Map()) {
  // 如果是基本类型，直接使用严格比较
  if (a === b) return true
  // 防止循环引用对象的比较
  if (map.has(a) && map.get(a) === b) return true
  // 保存本次比较记录，防止循环引用对象的比较
  map.set(a,b)
  if (typeof a === 'object' && typeof b === 'object') {
    let a_keys = Reflect.ownKeys(a)
    let b_keys = Reflect.ownKeys(b)
    if (a_keys.length !== b_keys.length) return false
    // 不能用forEach,否则不相等时无法跳出本次循环,for可以
    // 使用for遍历keys的数组，所以是a[a_keys[i]]才能取到对应的值
    for(let i =0; i < a_keys.length; i++) {
      if (!isEqual(a[a_keys[i]], b[b_keys[i]], map)) return false
    }
    return true
  }
  return false
}
```
可以通过这个链接测试函数是否成功
[手写isEqual()](https://bigfrontend.dev/zh/problem/implement-deep-equal-isEqual)
