/**
 * 
 * @param {*} context 要绑定this的上下文
 * @returns 
 */
Function.prototype.MyCall = function(context) {
    if (typeof this !== 'function') {
        throw new Error('被劫持者不是一个函数')
    }
    context = context || window
    let args = Array.from(arguments).slice(1)
    context.fn = this
    let result = context.fn(...args)
    delete context.fn
    return result
}

// 测试用例
class Person {
    constructor(name) {
        this.name = 'someone'
    }
    sayName() {
        console.log(this.name)
    }
}

const Louis = {name: 'louis'}
const someone = new Person('someone')
someone.sayName()
someone.sayName.MyCall(Louis)
const stringObj = {
    name: 'string'
}