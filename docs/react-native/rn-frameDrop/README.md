# 避免掉帧的解决方案

## 掉帧
rn可以在app中交互流畅是因为它提供了60fps的帧率，也就是UI线程16.67ms刷新一次页面，如果当前执行的任务不能在16.67ms执行完成,那么就会出现掉帧，当掉帧的时长超出100ms时，用户就可以很明显的感知到

## 出现掉帧的原因

### rn视图更新流程
首先判断是否需要刷新，对`state`和`props`进行浅比较，如果发现不同则会触发js端的`render`函数
`render`函数执行会触发`ReactNativeRenderer`通知原生端更新视图
原生端`initView`收到更新通知后会根据信息内容创建对应的原生视图和虚拟DOM，并把原生视图添加到待渲染队列中，
同时由虚拟 DOM 来对接收到的 JavaScript 样式和布局信息做转换
当js端通过`setChild`发起实际渲染请求后，原生端会根据js端传递的视图tags去待渲染队列中查找实际更新的视图，
并把视图批量添加到父视图让gpu渲染，如果没有找到对应的tags，表示该视图正在创建或者转换中，
这样原生端就会等待下一次发起渲染请求时才会对这个试图更新
### 掉帧的原因
所以，如果以上操作没有在16.67ms中完成，那么就会出现掉帧现象

## 解决掉帧的方法
### scu渲染优化
类组件通过`shouldComponentUpdate`函数进行严格控制，也就是把是否触发渲染的判断交由自己的代码来决定
因为不使用`scu`的话，总是返回默认的`true`所以可能会由此触发一些不必要的更新。

### InteractionManager
是rn的交互管理器，作用是可以优先让交互行为（例如说滚动界面）或者动画优先执行，避免用户操作时重新渲染UI，从而防止丢帧现象
例如,
```javascript
api.getUserInfo().then(res => {
    InteractionManager.runAfterInteractions(() => {
        // 延迟执行的任务
    })
})
```