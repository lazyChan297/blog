/**
 * 利用闭包的方式实现防抖
 * @param {*} fn 需要防抖的回调函数
 * @param {*} delay 需要防抖的时间值
 * @returns 
 */
function debounce(fn, delay) {
    let timer;
    return function() {
        clearTimeout(timer)
        let args = Array.from(arguments)
        setTimeout(() => {
            fn.call(this, ...args)
        }, delay);
    }
}
function debounce(fn, delay) {
    return function() {
        clearTimeout(fn.clear)
        let args = Array.from(arguments)
        fn.clear = setTimeout(() => {
            fn.call(this, ...args)
        }, delay);
    }
}