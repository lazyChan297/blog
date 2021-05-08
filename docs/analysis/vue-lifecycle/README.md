# 生命周期源码解析

## 初始化流程的生命周期

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

总结：

1. new Vue() 后先初始化事件，生命周期，混合器，然后执行**beforeCreate**

2. 执行完**beforeCreate**后开始初始化inject，data，props，methods，provide

3. 以上初始化完成后，执行**created**

4. 执行**mountComponent**，该函数的执行逻辑是执行**beforeMounted**钩子然后调用**vm._update()**
5. **vm._update()**接收**vm._render()**函数返回的vnode作为参数；vm._render()前还执行了编译模板的**parse**；得到ast；执行**optimize**，对ast优化；执行**generate**，得到function render()，赋值给vm._render()
6. **vm._update()**通过patch把vnode生成dom挂载
7. 执行**mounted**

## 更新流程的生命周期

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

总结

- flushing标记是否有在遍历queue，执行队列中watcher的更新方法
- waiting标记是否有flushSchedulerQueue在微任务队列等待执行
- has记录排队在queue的watcher，如果has[id]==null 表示当前watcher首次进入队列 has[id]==true 表示watcher已经进入queue队列

**首先，组件更新触发watcher实例的update方法
其次，如果是异步更新的组件则 执行queueWatcher(watcher)
queueWatcher会判断当前有没有queue在flushing，没有在flushing则把watcher添加到queue末端，有则根据watcher.id的值插入到queue对应的位置中
接着，queueWatcher会判断waiting，如果没有flushSchedulerQueue在排队则把flushSchedulerQueue推入nextTick等候，并把waiting标记为true
flushSchedulerQueue负责遍历queue执行watcher的更新求值方法，调用beforeUpdate钩子，清空queue，has和调用watcher的update钩子，把重新把flushing waiting标记为false**

## 组件销毁流程的生命周期

首先执行**beforeDestroy**

如果组件存在parent则清除父子关系

移除组件的watcher和订阅者

执行**destroyed**