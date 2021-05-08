# vue2.x.x响应式原理

## 实现响应式对象
首先将data变为响应式，当data发生改变时，依赖data的对象可以自动更新
```javascript
export default function reactive(data) {
	if (data !== null && typeof data === 'object') {
 		Object.keys(data).forEach(key => {
      // 将对象转换为响应式对象的核心实现
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
```

## 实现Dep
为data添加一个订阅者`Dep`，`Dep`负责为响应式对象data添加观察者`addSub()` 和派发更新`notify`

```javascript
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
```

## 实现Watcher
`Watcher`负责构造观察者实例和执行实例的update方法
`watcher`实例观察data，当data发生变化时立即作出相应执行`update`方法

```javascript
// 观察者 （观察data的变量）
class Watcher {
    /**
     * @param {*} getter getter函数会触发data的get方法收集依赖
     * @param {*} opt computed watcher cb（watch的回调函数） 
     */
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

export default Watcher
```

## 实现计算属性

computed既是一个响应式对象同时也是一个观察者
作为响应式对象时与data一样拥有自己的订阅者和观察者列表
作为观察者时与watcher一样，依赖其他属性 `computed: {sum(){return a + b}}`

```javascript
/**
 * @param {*} getter 触发computed属性依赖的对象的get方法的回调函数
 * @returns 
 */
export default function computed(getter) {
    let computedWatcher = new Watcher(getter, { computed: true })
    let result = {}
    Object.defineProperty(result, 'value', {
        get() {
            // 收集computed的依赖
            computedWatcher.addSub()
            // 返回它所依赖对象的value
            return computedWatcher.get()
        }
    })
    return result
}
```

## 实现watch
watch与computed很相似，区别只在于当watch依赖的属性更新时它会立即执行更新后的callback不会缓存
```javascript
function watch(getter, cb) {
  new Watcher(getter, { watch: true, cb })
}
```

## demo测试示例
基于以上代码，测试功能是否实现
```javascript
let hotel = {
  address: '人民中路111号',
  price: 1000,
}

// 将hotel变为响应式
reactive(hotel)
// 创建观察者louis
new Watcher(() => {
    console.log(`louis already received the address ${hotel.address}`)
})
// 创建观察者Jackson
new Watcher(() => {
    console.log(`jackson already received the address ${hotel.address}`)
})

// 修改address
hotel.address = '人民中路112号'

// 创建totals对象并把它变为响应式
let totals = {days: 1}
reactive(total)
// 创建计算属性sum. 
let sum = computed(() => {
    log(`Latest price is ${total.days * hotel.price}`)
})

// sum计算属性的依赖,触发计算属性的get
let depend = sum.value

// watch
watch(function(){
    return hotel.address
}, (val, oldVal) => {
    log(`地址已经从${oldVal}替换为新地址：${val}`)
})

hotel.address = '人民中路113号'
```

## 小结
Vue.2.x.x的响应式原理是基于`Object.defineProperty`api结合观察者模式实现的；
`Object.defineProperty`劫持get和set方法将对象对象响应式；
为响应式对象创建一个订阅者Dep，Dep可以添加观察者和通知观察者；
当访问对象（触发get）时Dep为data收集依赖添加观察者；触发set方法时派发更新通知观察者对象已更新
观察者被添加后可以观察data，当data更新后可以自动响应执行update

## vue2.x.x 监听数组的变化
由于`Object.defineProperty`api的限制，无法监听数组的变化，但是可以通过劫持部分数组的原型方法实现响应

1. 劫持了对数组本身发生变化的7个方法`splice` `push` `pop` `unshift` `shift` `sort` `reverse`
2. 通过`Object.defineProperty` 重写以上方法的value，通过`mutator`方法返回；
3. `mutator`方法执行的过程中会派发更新，如果有新元素增加则将新增的元素observe(变为响应式对象，实现监听)

```javascript
// vue 源码部分
// 缓存array所有的原型方法
var arrayProto = Array.prototype;
// 继承array所有的原型方法并隔绝
var arrayMethods = Object.create(arrayProto)
// 会改变数组本身的方法
var methodsToPatch = ['push','pop','shift','unshift','splice','sort','reverse']
methodsToPatch.forEach(function(method) {
// Array.prototype原型方法
var origin = arrayProto[method]
  // def调用Object.definePrototy 将value 重写成了mutator方法，调用以上七个方法时触发mutator
  def(arrayMethods, method, function mutator() {
    var args = [], len = arguments.length
    while(len-- ) arg[len] = arguments[len]
    // result作为新数组返回
    var result = origin.apply(this, args)
    var ob = this.__ob__;
    // 是否有新增元素
    var inserted;
    switch(method) {
      case 'push':
      case 'unshift':
        inserted = args // 新增的元素
        break;
      case 'splice':
        inserted = args.slice(2) // splice存在新增&删除的可能,所以取第二个元素
        break;
    }
    if (inserted) ob.observeArray(inserted)
    ob.dep.notify() // 派发更新
    return result
  })
})
```

## Vue.$set实现原理
由于`Object.defineProperty`api的限制，对象新增的属性也无法监听，但是可以通过vue.$set()为新增的属性实现响应式

::: tip
target: 新增属性的目标对象
key: 新增属性的key名
value: 新增属性的值
:::

* 如果target是数组且key为合法长度，则通过劫持数组变化的splice对数组进行修改，并实现响应式并返回value
* 如果添加的key原本就存在target中，则更新target[key]的值并返回value
* 获取target.的__ob__属性，如果ob不存在则target不是响应式对象，为target[key]赋值value并返回
* target是响应式对象，调用defineReactive(ob.value, key, value)，为新增的key实现响应式并派发更新，最后返回value

### 实现源码
```javascript
export function $set(target, key, value) {
  // isValidArrayIndex负责判断key是否大于array长度导致赋值错误
  if (Array.isArray(target && isValidArrayIndex(key))) {
    // 重新修改数组长度
    target.length = Math.max(target.length, key)
    // 通过splice劫持触发响应式
    target.splice(key, 1, value)
    return value
  }
  // 如果key原本就存在target上直接赋值并返回value
  if (key in target && !(key in Object.prototype)) {
    target[key] = value
    return value
  }
  // 获取target的observe
  const ob = target.__ob__
  // target不是响应式
  if (!ob) {
    target[key] = value
    return value
  }
  // 增加key的响应式处理
  defineReactive(ob.value, key, value)
  // 派发更新
  ob.dep.notify()
  return value
}
```
