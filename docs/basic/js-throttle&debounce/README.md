# 节流函数和防抖函数

## 节流函数
在指定的时间单位内，重复调用函数只会执行一次；
第一次调用时会立即执行，规定等待时间内重复调用则会在时间段内只执行一次；

### 常见场景
1. 懒加载
2. input输入触发请求

### 实现思路
1. 利用闭包，缓存了函数上一次执行时间戳`last`和计时器`timer`；
2. 每次调用时获取当前时间戳`now`和缓存的`last`进行比较，
    `now >= last + delay` -> 立即执行
    `now < last + delay ` -> 延迟执行
3. 利用定时器来控制函数执行的时机，延迟执行后更新`last`为当前时间戳并清除计时器

### 实现代码
```javascript
function throttle(fn, delay) {
  // 利用闭包缓存上一次执行时间和定时器，同时通过last判断是否是第一次调用
  let last, timer, now = +new Date()
  return function() {
    // 实际入参
    let args = Array.from(arguments)
    // 小于规定时间内调用，重新为定时器赋值，定时器函数体执行后清空定时器
    if (last && now < delay + last) {
      timer = setTimeout(() => {
        clearTimeout(timer)
        // 缓存本次调用的时间戳
        last = now
        fn.apply(this, args)
      }, delay)
    } else {
      // 缓存本次调用的时间戳
      last = now
      // 第一次调用or大于规定时间内调用，直接执行
      fn.apply(this, args)
    }
  }
}
```

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

