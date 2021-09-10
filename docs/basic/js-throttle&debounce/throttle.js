/**
 * 
 * @param {*} fn 节流函数
 * @param {*} wait 等待时间
 */
function throttle(fn, wait = 2000, options = {}) {  
    let lastTime = 0, timeout;
    return function() {
        // 每次回调时间
        let now = new Date().getTime()
        // 判断是否是第一次调用且是否设置了第一次调用就立即执行
        if (!lastTime && options.lastTime === false) lastTime = now
        // 时间差，小于等于0表示超出等待时间可以执行
        let diff = wait - (now - lastTime)
        // 执行回调函数的参数格式化
        let args = Array.from(arguments)
        if (diff <= 0) {
            lastTime = now
            fn.apply(this, args)
        } else if (!timeout && options.delayExecute !== false) {
            timeout = setTimeout(() => {
                lastTime = new Date().getTime()
                clearTimeout(timeout)
                timeout = null
                fn.apply(this, args)
            }, wait)
        } 
    }
}