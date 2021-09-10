# 节流函数和防抖函数
## 防抖
调用防抖函数时会延迟执行，至少在指定的时间单位后才会执行

### 常见场景
点击提交事件

### 实现思路
1. 仍然是通过闭包对计时器保存，每次调用函数时对计时器进行clear操作再对计时器重新赋值；这样做的目的是保证函数多次调用时，控制它执行时机的在内存中始终是同一个计时器

### 实现代码
```javascript
function debounce(fn, delay) {
  return function() {
    clearTimeout(fn.timer)
    let args = Array.from(arguments)
    fn.timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
// 或许也可以这样实现；与实现方式的区别在于1使用函数的属性来保存计时器，2使用闭包来缓存
function debounce(fn, delay) {
    let timer;
    return function() {
        let args = Array.from(arguments)
        clearTimeout(timer)
        setTimeout(() => {
            fn.call(this, args)
        }, delay)
    }
}
```
## 节流函数
在指定的时间单位内，重复调用函数只会执行一次；

节流函数的需求比防抖的复杂些
第一次触发时，是否需要等待指定的执行单位
最后一次触发时，是否还会继续执行

### 常见场景
1. 懒加载
2. input输入触发请求

### 实现思路
1. 利用闭包，缓存了函数上一次执行时间戳`lastTime`和计时器`timeout`
2. 判断是否是首次调用且首次调用是否需要立即执行，设置`immediate`字段表示是否立即执行
3. 如果是首次调用 lastTime必然为`0`，如果首次调用不需要立即执行 将`lastTime`设置为当前时间
4. 通过时间差`diff`字段来判断是否满足执行的时间
**时间差 = 等待时间 - (当前时间-上一次执行时间)**
如果diff <= 0 则必然超出等待时间，可以执行函数

否则进入下一个判断 

判断 定时器 是否存在 和 判断 是否需要最后一次调用后还执行 `delayExecute`(比如输入框连续输入，最后一次字符输入完是否还需要再执行一次)

如果 定时器 存在 什么也不做

如果 定时器 不存在 且 需要最后一次调用也执行

则给timeout赋值为倒计时执行，`timeout = setTimeout(() => {...})`

setTimeout的函数体内需要做以下几件事
- 执行回调函数前， 更新`lastTime`，注意`lastTime`不能赋值为`now` 因为它是延时执行，应该赋值为当前的时间戳
- 清空上一个倒计时，将`clearTimeout(timeout)`，同时把`timeout`赋值为`null`，，否则不会执行下一次
- 执行回调函数


### 实现代码
```javascript
function throttle(fn, wait, options = {}) {
  // 利用闭包缓存定时器, 上一次执行的时间，以便和当前执行的时间比较，是否满足执行的条件
  let timeout, lastTime = 0
  return function() {
    let now = new Date().getTime()
    if (!lastTime && options.immediate === false) lastTime = now
    let diff = wait - (now - lastTime)
    let args = Array.from(arguments)
    if (diff <= 0) {
      lastTime = now
      fn.apply(this, args)
    } else if (!timeout && options.delayExecute !== false) {
      timeout = setTimeout(() => {
        clearTimeout(timeout)
        timeout = null
        lastTime = new Date().getTime()
        fn.apply(this, args)
      }, wait)
    }
  }
  
}
```
