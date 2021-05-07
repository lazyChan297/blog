# js设计模式

## 观察者模式
`publisher`负责维护被观察的对象、增加移除观察者、对象修改时通知观察者
`observer`负责订阅观察对象，当对象变化自动更新

### 实现代码
```javascript
class Publisher {
    constructor() {
        this.observers = []
        this.notice = null
    }
    get info() {
        return this.notice
    }
    set info(val) {
        this.notice = val
        this.notify()
    }
    // 增加订阅者
    add(observer) {
        this.observers.push(observer)
    }
    // 移除订阅者
    remove(observe) {
        this.observers.forEach((item, index) => {
            if (item === observe) {
                this.observers.splice(index, 1)
            }
        })
    }
    // 通知订阅者
    notify() {
        this.observers.forEach((item) => {
            item.update(this.notice)
        })
    }
}

class Observer {
    constructor() {
        this.info = null
    }
    update(notice) {
        this.info = notice
        this.work()
    }
    work() {
        // todo
        console.log(`i am already receive the notice:${this.info}`)
    }
}

let manager = new Publisher()
let employee = new Observer()
manager.add(employee)
manager.info = 'start working' // i am already receive the notice:start working
manager.info = 'stop working' // i am already receive the notice:stop working
```

## vue2.x.x的设计模式
vue2.x.x的响应式原理就是基于观察者模式实现
`Observer`负责把对象变为响应式对象
`watcher`作为观察者，执行更新后的一系列操作
`Dep`作为订阅者，通知观察者对象变化和为响应式对象收集依赖

### 实现代码
```javascript
// 首先将data变为响应式，当data发生改变依赖data的对象可以自动更新
export default function reactive(data) {
	if (data !== null && typeof data === 'object') {
 		Object.keys(data).forEach(key => {
      			// 首先将对象转换为响应式对象
            defineReactive(data, key)
        })
  } 	
}

// 转换为响应式对象的核心实现基于Object.defineProperty
function defineReactive(data, key) {
	let value = data[key]
    const dep = new Dep()
    Object.defineProperty(data, key, {
        // 劫持get，收集依赖
        get() {
        // 收集依赖
        dep.addSub()
        return value
        },
        set(newVal) {
        value = newVal
        // 劫持set，派发更新
        dep.notify()
        }
    })
    // 如果data属性也是对象 递归处理
    if (value && typeof value === 'object') {
        reactive(value)
    }
}


// 实现订阅者
// 为data添加一个订阅者`Dep`，`Dep`负责为响应式对象data添加观察者`addSub()` 和派发更新`notify`
class Dep {
    constructor() {
        this.subs = new Set()
    }
    // 添加观察者
    addSub() {
        if (Dep.target)  this.subs.add(Dep.target)
    }
    // 通知所有观察者
    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}

// targetStack负责缓存正在更新的watcher
const targetStack = []

// 将上一个watcher push到targetStack，把当前的watcher赋值给Dep.target
function pushTarget(target) {
    if (Dep.target) targetStack.push(Dep.target)
    Dep.target = target
}

// 把Dep.target赋值给上一个watcher
function popTarget() {
    Dep.target = targetStack.pop()
}
// 观察者
class Watcher {
    constructor(getter, opt = {}) {
        // getter 触发收集依赖的function
        this.getter = getter
        let { computed, watch, cb } = opt
        this.computed = computed
        this.watch = watch
        this.cb = cb
        if (this.computed) {
            // 观察者为computed,增加它的观察者Set
            this.dep = new Dep()
        } else {
            // 执行get求值方法，computed存在惰性加载所以初始化时不会执行
            this.get()
        }
    }
    // 求值
    get() {
        // 将Dep.target赋值给当前watcher
        pushTarget(this)
        // 收集依赖&返回观察到最新的值
        this.value = this.getter()
        // 将Dep.target重新赋值给上一个watcher
        popTarget()
        return this.value
    }
    update() {
        if (this.computed) {
            // 计算属性watcher通知它自身的观察者,和劫持data的set派发更新相同
            this.dep.notify()
            this.get()
        } else if (this.watch) {
            // 缓存上一个值
            const oldVal = this.value
            this.value = this.get()
            // 执行watch的回调
            this.cb(this.value, oldVal)
        } else {
            this.get()
        }
    }
    addSub() {
        this.dep.addSub()
    }
}

```
### Demo
[demo源码地址](https://github.com/lazyChan297/vue-analysis)

## 订阅-发布者模式
发布者负责通知订阅者并传递值
订阅者负责接收通知并对传递的值执行回调函数

### 实现代码
```javascript
class eventEmitter {
    constructor() {
        this.handles = {}
    }
    // 发布
    emit(eventName, ...args) {
        if (this.handles[eventName]) {
            this.handles[eventName].forEach(cb => {
                cb(...args)
            });
        }
    }
    // 订阅
    on(eventName, cb) {
        if (!this.handles[eventName]) {
            this.handles[eventName] = []
        }
        this.handles[eventName].push(cb)
    }
    // 取消订阅
    off(eventName, cb) {
        let index = this.handles[eventName].indexOf(cb)
        this.handles[eventName].splice(index, 1)
    }
    // 只订阅一次
    once(eventName, callback) {
        let once = (...args) => {
            callback(...args)
            this.off(eventName, once)
        }
        this.on(eventName, once)
    }
}

let worker = new eventEmitter()

worker.on('notify', function(data) {
    console.log(`notify ${data}`)
})

worker.emit('notify', 'start work')
worker.emit('notify', 'stop work')

worker.once('onlyTimes', function(data) {
    console.log(data)
})

worker.emit('onlyTimes', 1)
worker.emit('onlyTimes', 2)
worker.emit('onlyTimes', 3)
```

## 单例模式
单例模式指的是构造函数只能创建一个实例，多次创建时返回的仍然是第一次创建的实例

### 实现方式1-静态方法
```javascript
class Singleton {
    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton()
        }
        return Singleton.instance
    }
}
```

### 实现方式2-闭包
```javascript
    function singletonClosure() {
        let instance = null
        return function() {
            if (!instance) {
                instance = new singletonClosure()
            }
            return instance
        }
    }
    const getSingleton = singletonClosure()
    let single = new getSingleton()
    let single2 = new getSingleton()
    single === single2 // true
```