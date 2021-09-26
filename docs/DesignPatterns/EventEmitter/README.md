# EventEmitter
事件中心可以对指定的事件发布、监听，从而自动执行它触发后的回调

## 具体实现
### on、emit、off、once
- 发布订阅者模式，由一个事件实例来负责事件的监听，发布，取消发布，只监听一次，<br/>
所以需要实现`on(监听）`，`emit(发布)`，`off（取消发布）`，`once（只监听一次）`这四种实例方法。<br/>
### 构造函数
- 一个事件实例同时可以监听多个事件，用一个`handles`对象来保存它所有的事件，<br/>
所以在构造实例时需要添加`this.handles = {}`属性，<br/>
一个事件可以被多个函数监听，所以`handles`的键值对结构是`{事件名:监听回调函数数组}`

### on（监听）
- 首先判断该事件是否有注册，如果有将监听函数添加到`handles`对应的事件属性中，<br/>
如果没有先添加事件在添加监听函数
```javascript
on(eventName, callback) {
    if (!this.handles[eventName]) {
        this.handles[eventName] = []
    }
    this.handles[eventName].push(callback)
}
```

### emit（发布）
发布事件前先判断有注册监听函数，如果有获取该事件所有的监听函数并拷贝，<br/>
::: tip 拷贝的原因
**因为，当发布的事件中，如果有仅仅监听一次的函数，那么遍历该函数后就会删除，所以不可以在遍历原函数数组时删除**
:::
拷贝后遍历监听函数数组，让所有监听该事件的函数执行回调
```javascript
emit(eventName, ...args) {
    if (!this.handles[eventName]) return
    let callbacks = this.handles[eventName].slice()
    callbacks.forEach(callback => {
        callback(...args)
    });
}
```

### off（取消监听）
取消某个事件里某个函数的监听，注意不是删除事件，当某一个事件没有监听函数时，才能删除
```javascript
    off(eventName, callback) {
        if(!this.handles[eventName]) return
        let callbacks = this.handles[eventName]
        let index = callbacks.indexOf(callback)
        callbacks.splice(index, 1)
    }
```

### once（只监听一次）
为实现只监听一次的需求，当某个事件的监听函数执行后就要立即`off`，所以需要修改该监听模式的注册方法，<br/>
重新实现一个函数`oneTime`，该函数先执行原本的回调，执行完毕后立即执行注销
::: tip 注销的函数
为满足执行后注销，所以添加的监听方法是`oneTime`，而不是原本的`callback`
:::
```javascript
once(eventName, callback) {
    let _once = (...args) => {
        callback(...args)
        this.off(eventName, _once)
    }
    this.on(eventName, _once)
}
```

### 完整代码
```javascript
    class EventEmitter {
        constructor() {
            this.handles = {}
        }
        emit(eventName, ...args) {
            if (!this.handles[eventName]) return
            let callbacks = this.handles[eventName].slice()
            callbacks.forEach(callback => {
                callback(...args)
            });
        }
        on(eventName, callback) {
            if (!this.handles[eventName]) {
                this.handles[eventName] = []
            }
            this.handles[eventName].push(callback)
        }
        once(eventName, callback) {
            let _once = (...args) => {
                callback(...args)
                this.off(eventName, _once)
            }
            this.on(eventName, _once)
        }
        off(eventName, callback) {
            if(!this.handles[eventName]) return
            let callbacks = this.handles[eventName].slice()
            let index = callbacks.indexOf(callback)
            callbacks.splice(index, 1)
        }
    }
```