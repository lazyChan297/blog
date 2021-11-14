# 生命周期

## 初始化
- `_init()`函数：初始化生命周期函数，事件，渲染函数
- 调用`beforeCreate`钩子：初始化injection，state，provide
  - 调用`created`钩子
- 执行`mountComponent`函数，创建updateComponent函数作为组件更新时调用，负责为组件创建观察者实例，然后返回当前组件实例
如果没有定义`render`函数，会给当前实例的render赋值为一个创建空节点的函数`createEmptyVNode`，`createEmptyVNode`函数会创建一个空的`new VNode()`对象返回
  - 执行`beforeMount`勾子函数
  - 创建一个`updateComponent`函数
    - 调用编译过程中生成的`vm._render()`函数（通过parse->optimize->generator返回的js字符串函数)执行，返回一个`VNode`对象
    - 调用`vm._update(vnode)`其中涉及了patch、diff的流程
  - 创建`new Watcher(vm, updateComponent)`实例，用当前组件(vue实例也就是vm)，和定义好的`updateComponent`函数。执行构造函数过程中会调用`updateComponent`方法，具体流程是组件求值的时候执行了`watch.get()`,`watch.get()`内部调用了`updateComponent`，所以根据组件自身的render函数`vm._render()`得到新的vnode，再调用`vm._update()`函数，`vm._update()`函数内部会调用`vm.__patch__()`进入新旧节点对比，找到差异后通过document的api更改视图
注意，如果在patch过程中遇到子节点，就会开始新一轮子节点初始化流程的生命周期，直到子节点初始化生命周期执行完毕，才会继续当前节点初始化的生命周期

## 更新流程
1. 响应式对象更新，set劫持被触发，当前响应式对象的dep派发更新
2. 响应式对象的观察者的update方法被触发。因为vue使用了批量异步更新策略，所以会把组件自身添加到异步更新的队列中，通过nextTick控制需要更新的组件在异步任务队列中批量执行
3. 当事件循环到异步任务执行，响应式对象的执行它的`updateComponent()`方法，该方法调用了`_vm.render()`，访问到了最新的响应式属性值，返回新的`VNode`对象。接着调用`vm._update(node)`方法，对比新旧虚拟dom的差异，最终通过差异定位要更新的视图内容，实现更新


## 组件销毁
1. 执行**beforeDestroy**
2. 如果组件存在parent则清除父子关系
3. 移除组件的watcher和订阅者
4. 执行**destroyed**