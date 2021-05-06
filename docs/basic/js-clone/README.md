# 深浅拷贝

## 浅拷贝
拷贝的是引用类型的内存地址的指针，拷贝的值与被拷贝的值指向的是同一堆内存，两个值之间会互相影响

### 浅拷贝的实现
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
拷贝的是值本身，拷贝的对象和被拷贝对象指向的不是同一堆内存，两个值之间互相独立

```javascript
/**
  1、满足symbol类型的拷贝
  2、支持循环引用的对象
  3、支持函数序列化
*/
function DeepClone(obj) {
  const isFunction = (o) => typeof o === 'function' && o !== null
  const isObject = (o) => typeof o === 'object'
  const isArray = (array) => Array.isArray(array)
  let target = isArray(obj)? [...obj] : {...obj}
  // Reflect.ownKeys可以把symbol属性遍历
  Reflect.ownKeys(target).foEach(key => {
    target[key] = isFunction(target[key]) ? target[key] : isObject(target[key]) ? DeepClone(target[key]) : target[key]
  })
  return target
}
```

