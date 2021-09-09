/**
 * 
 * @param {*} context 要绑定this的上下文
 * @param {*} boundArgs 绑定this时传入的参数
 */
Function.prototype.MyBind = function(context) {
    if (typeof this !== 'function') {
        return false
    }
    context = context || window
    let that = this
    let boundArgs = Array.from(arguments).slice(1)
    let fn = function() {
        let args = Array.from(arguments).concat(boundArgs)
        return that.call(this instanceof that ? this : context, args)
    }
    fn.prototype = Object.create(that.prototype)
    return fn
}


// 测试用例
function Person(name) {
    this.name = name
}
Person.prototype.sayName = function(arg) {
    console.log(this.name, arg)
}

// new操作符调用
const louis = {name: 'louis'}
const louisBoundFn = Person.MyBind(louis)
const otherLouis = new louisBoundFn('hh')
otherLouis.sayName()
console.log(otherLouis instanceof Person)

// 普通函数调用
const generalFn = Person.prototype.sayName.MyBind(louis, '666')
generalFn('777')

