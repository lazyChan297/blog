/**
 * 
 * @param {*} context 要绑定this的上下文
 * @param {*} argsArray 参数数组
 */
Function.prototype.MyApply = function(context, argsArray) {
    if (typeof this !== 'function') {
        throw new Error('被劫持者不是一个函数')
    }
    context = context || window
    let result
    context.fn = this
    if (argsArray && argsArray.length) {
        args = Array.from(arguments).slice(1)
        result = context.fn(...args)
    } else {
        result = context.fn()
    }
    delete context.fn
    return result
}
// 测试用例
function logArray(arr) {
    console.log(arr)
}

class Person {
    constructor() {
        this.array = [1,3,5,7,9]
    }
    logArray () {
        console.log(this.array)
    }
}

const Louis = {array: [2,4,6,8,10]}
const someone = new Person()
someone.logArray.MyApply(Louis, Louis.array)