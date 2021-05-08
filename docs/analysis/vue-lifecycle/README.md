# 生命周期源码解析

## 初始化流程的生命周期

### 执行逻辑
1. `_init()`函数；
 - 初始化生命周期函数，事件，渲染函数
2. 调用`beforeCreate`钩子
  - 初始化injection，state，provide
3. 调用`created`钩子
  - 执行`$el`挂载方法，将渲染的节点挂载到dom上，收集依赖
4. 执行`mountComponent`函数，挂载节点的核心部分
5. 调用`beforeMount`钩子
6. 创建`new Watcher()`实例，触发data收集依赖
  - 执行`parse`得到ast
  - 执行`optimize`优化ast
  - 执行`generate`将ast生成渲染函数`function render(){}`
  - 执行`_vm.render()`， 也就是执行`generate`返回的渲染函数，得到vnode节点
  - 执行`_vm.update()`将vnode节点通过patch挂载到dom节点上
  - 注意，如果在patch过程中遇到子节点，就会开始新一轮子节点初始化流程的生命周期，直到子节点初始化生命周期执行完毕，才会继续当前节点初始化的生命周期
6. 调用`mounted`钩子，此时可以访问dom节点上的元素

### 源码部分
```javascript
Vue.prototype._init = function() {
  initLifecycle(vm);
  initEvents(vm);
  initRender(vm);
  // 1. 执行beforeCreate钩子
  callHook(vm, 'beforeCreate'); // 此时拿不到data、methods、props
  initInjections(vm); 
  initState(vm);
  initProvide(vm);
  // 2. 执行created钩子
  callHook(vm, 'created'); // 可以拿到data method props
	if (vm.$options.el) {
    // 3. 执行el挂载的方法
    vm.$mount(vm.$options.el);
  }
}

// 执行el挂载的方法返回mountComponent，挂载dom的核心
Vue.prototype.$mount = function (el){
  return mountComponent(this, el, hydrating)
}

// mountComponent
function mountComponent() {
  callHook(vm, 'beforeMount'); // 执行beforeMount钩子
  var updateComponent;
  updateComponent = function () {
    // vm._update根据vm._render()返回的vnode,执行patch，生成新的dom.
    // 如果在patch过程中遇到了子节点，也同样会重复以上的操作，直到子节点遍历完
    vm._update(vm._render(), hydrating); 
  };
  // 收集依赖
  new Watcher(vm, updateComponent, noop, {
    before: function before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate'); // 执行beforeUpdate钩子
      }
    }
  }, true /* isRenderWatcher */);
  callHook(vm, 'mounted') // 执行mounted流程
}
```


## 更新流程的生命周期
::: tip 一些变量和函数说明
1. has：保存当前watcher的id的对象，has[id]为null表示没有被保存，true表示已经保存

2. queue：保存需要异步更新的watcher实例的队列

3. flushing：标记是否有在遍历queue，执行队列中watcher的更新方法

4. flushSchedulerQueue：负责遍历queue执行watch具体更新方法(调用`beforeUpdate`钩子和`updated`钩子)的函数

5. waiting：标识是否有flushSchedulerQueue函数在执行，有waiting为true，反之为false

6. resetSchedulerState：负责清空has对象和queue队列，重置flushing和waiting状态的函数

7. nextTick：dom更新后的延迟回调

8. callbacks：保存更新回调函数的数组

9. pending：表示当前是否在`flushCallbacks`在执行

10. flushCallbacks：负责将pending设为false，遍历callbacks数组的函数

11. timeFunc：通过`Promise`or`setImmediate`or`setTimeout`or`MutationObserver`实现的微任务函数，在它的异步回调里执行`flushCallbacks`，使callback在本轮事件循环结束后执行


:::

### 执行逻辑
- 组件更新触发watcher实例的`update`方法
- 执行`queueWatcher`函数（异步更新的组件会命中这一步逻辑）
  - 当前watcher.id没有被加入has对象中，将has[id]标记为true
  - flushing判断
    - flushing = true，遍历queue，根据id找到队列对应的位置插入，因为watcher.id是按顺序自增
    - flushing = false，直接push(watcher)
  - waiting判断
    - waiting = true，不会继续执行，等待下一轮nextTick
    - waiting = false，开始执行`nextTick(flushSchedulerQueue)`并把waiting设为true
- 执行`nextTick(flushSchedulerQueue)`
  - 将`flushSchedulerQueue`推入callbacks数组
  - pending为false，执行`timeFunc`，并把pending设为true
- 执行`timeFunc`
  - `timeFunc`把`flushCallbacks`函数注册到异步任务队列
- 本轮事件循环结束，执行微任务`flushCallbacks`
  - 把pending设为false
  - 遍历执行callbacks上的函数
- 遍历到`flushSchedulerQueue`函数
  - 将flushing标记为true，当更新过程中有新的watcher加入时让它插入到对应位置，维护更新的顺序
  - queue.sort()，调整队列中watcher的排序
  - 遍历watcher
    - watcher.before = true，执行`beforeUpdate()`钩子
    - has[watcher.id] = null,重置has[id]
    - 执行watcher.run(),更新watcher观察的值
  - 执行`resetSchedulerState`函数，flushing、waiting设置为false,清空queue和has
  - 倒序遍历queue，执行`update`钩子

### 源码部分 
```javascript
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    // 如果是异步组件
    queueWatcher(this);
  }
};

// queueWatcher
function queueWatcher(watcher) {
  var id = watcher.id;
  // has对象用来保存异步更新队列里的watcher id
  if (has[id] == null) {
  	has[id] = true
    // flushing 用来标识当前queue是否在清空
    if (!flushing) {
      // 如果没有在flushing,直接push
      queue.push(watcher)
    } else {
      // queue正在flushing,根据id找到队列对应的位置插入，因为watcher的id是按顺序自增
      var i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    if (!waiting) {
      // 如果没有flushing在执行，此处先忽略nextTick实现原理，只需要知道nextTick的作用是把清除queue队列上的回调函数放到异步队列
      nextTick(flushSchedulerQueue())
    }
  }
}

// flushing queue
function flushSchedulerQueue() {
	// 标记正在flushing
	flushing = true
	// 调整queue队列的排序
	queue.sort(function (a, b) { return a.id - b.id; })
	// 遍历执行watcher的更新方法
	for (index = 0; index < queue.length; index ++) {
		watcher = queue[index];
    if (watcher.before) {
      watcher.before(); // 此处执行beforeUpdate
    }
    id = watcher.id
    has[id] = null // 将has里的记录重新设置为null
    watcher.run() // 求最新值
	}
	// 拷贝queue队列，用于接下来调用updated钩子
	var updatedQueue = queue.slice();
	// queue上的watcher异步回调执行完毕后，重置queue,清空has,flushing和waiting标记为false
	resetSchedulerState()
	// 倒序执行updated钩子
	callUpdatedHooks(updatedQueue);
}
```
### 更新流程小结
当data更新时，触发了data的观察者watcher的update方法
update方法把需要更新的watcher添加到异步更新队列
清空队列的函数会遍历watcher执行run方法，调用`beforeUpdate`和`updated`钩子


## 组件销毁流程的生命周期

首先执行**beforeDestroy**

如果组件存在parent则清除父子关系

移除组件的watcher和订阅者

执行**destroyed**