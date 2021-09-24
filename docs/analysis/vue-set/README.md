# $set的实现原理
由于`Object.defineProperty`的限制，对象新增的属性无法监听，但是可以通过$set()为新增的属性实现响应式

::: tip 参数说明
target: 新增属性的目标对象 <br />
key: 新增属性的key名<br />
value: 新增属性的值<br />
:::
### 实现原理
* 如果要新增属性的对象（target）是数组且key为合法长度，则通过劫持数组变化的splice对数组进行修改，并为新增的元素实现响应式，最后返回value
* 如果添加的属性（key）原本就存在target中，则更新属性（target[key]）的值并返回value
* 通过获取要新增属性的对象（target）的__ob__属性，判断它是否已经是响应式对象，如果存在则是，不存在则证明它不是响应式，直接更新target[key]并返回更新后的属性值
* 如果要新增属性的对象(target)是响应式对象，调用defineReactive(ob.value, key, value)，为新增的属性值实现响应式并派发更新，最后返回更新后的值

### 实现源码
```javascript
export function $set(target, key, value) {
  // isValidArrayIndex负责判断key是否大于array长度导致赋值错误
  if (Array.isArray(target && isValidArrayIndex(key))) {
    // 重新修改数组长度
    target.length = Math.max(target.length, key)
    // 通过splice劫持触发响应式
    target.splice(key, 1, value)
    return value
  }
  // 如果key原本就存在target上直接赋值并返回value
  if (key in target && !(key in Object.prototype)) {
    target[key] = value
    return value
  }
  // 获取target的observe
  const ob = target.__ob__
  // target不是响应式
  if (!ob) {
    target[key] = value
    return value
  }
  // 增加key的响应式处理
  defineReactive(ob.value, key, value)
  // 派发更新
  ob.dep.notify()
  return value
}
```
