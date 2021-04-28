# 函数柯里化

## 柯里化
函数柯里化指的是将一个函数的多个参数进行拆分调用,当全部参数满足时,才会返回或者是执行需要柯里化函数的函数体

## 代码实现
```javascript
/**
 * @params fn 需要进行柯里化的函数
 * @params curryArgs 当前调用传入的参数
 * */
function curry (fn, currArgs) {
    return function() {
        let args = Array.from(arguments)
        // 对剩余参数的拼接
        if (currArgs !== undefined) {
            if (Array.isArray(currArgs)) {
                // 如果不是第一次调用,currArgs必然为数组结构
                args.unshift(...currArgs)
            } else {
                // 为了保证参数的传递顺序，使用unshift拼接参数数组
                args.unshift(currArgs)
            }
        }
       
        // 递归调用
        if (args.length < fn.length) {
            return curry(fn, args);
        }
        
        // 递归出口
        return fn.apply(null, args);
    }
}
```

### 实现思路
1. 通过闭包对前面的参数进行缓存；
2. 通过递归来拼接所有的参数，利用`fn.length`属性来判断是否全部获取；
3. 当递归结束，通过`apply`劫持函数调用并把所有的参数以数组的形式传递

## 柯里化的意义
1. 参数复用
```javascript
  function validate(reg, value) {
    return reg.test(value)
  }
  // currying后的函数，可以重复使用第一次传入的正则
  const validateLetter = curry(validate, /[a-z]+/g)
  validateLetter(1) // false
  validateLetter('louis') // true
```

2. 延迟执行
```js
  function sum(a,b,c) {
    return a+b+c
  }
  // currying后的函数
  let sumFn = curry(sum)
  // 保留前面传递的参数
  sumFn = sumFn(1)(2)
  // 等待合适的时机再执行
  setTimeout(() => {
    sumFn(3) // 6
  }, 1000)
```