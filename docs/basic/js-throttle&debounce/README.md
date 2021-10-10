# 节流、防抖
## 防抖
调用防抖函数时会延迟执行，至少在指定的时间单位后才会执行

**常见场景** 点击提交事件

通过给需要延迟执行的函数绑定`timer`属性，给该属性值赋值为定时器，每次调用时清空属性值定时器，重新计时
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
```

使用闭包来缓存对计时器变量保存，每次调用函数时对计时器进行clear操作再对计时器重新赋值，这样做的目的是保证函数多次调用时，控制它执行时机的在内存中始终是同一个计时器
```javascript
function debounce(fn, delay) {
    let timer;
    return function() {
        let args = Array.from(arguments)
        clearTimeout(timer)
        setTimeout(() => {
            fn.apply(this, args)
        }, delay)
    }
}
```
## 节流函数
在指定的时间单位内，重复调用函数只会执行一次，如果在指定的时间单位内再次调用则不会反应<br/>
节流函数的需求比防抖的复杂些，有时候还需要判断第一次触发时，是否需要等待指定的执行单位最后一次触发时，是否还会继续执行

**常见场景** 懒加载、input输入触发请求


- 利用闭包，缓存了函数上一次执行时间`lastTime`和计时器`timeout`
- 返回值函数判断等待时间-当前时间-上一次执行时间，如果小于0，立即执行函数，且把上一次执行时间更新为当前时间；如果大于0，意味着在指定时间内再次调用，如果定时器不存在，则将timeout赋值为等待时间后执行的定时器函数，函数体内重新把timeout设为空，定时器清空，执行函数，更新上一次执行时间更新为当前时间
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