# redux

## store
储蓄状态的唯一数据源

### 创建store
`createStore(reducer, applyMiddleware(...middles))`
接受两个参数`reducer` 和 `applyMiddleware(...middles)`中间件数组
- `reducer` 是对象，对象里的属性是各种各样处理state变更的函数
- `applyMiddleware` 是 `redux`提供创建中间件的方法 它接受一个数组作为参数，数组里可以是引入的第三方库也可以自定义

```javascript
import { applyMiddleware,createStore } from 'redux'
export default createStore(reducer, applyMiddleware(...middles))
```

## action
变更state的唯一方法。接受变更的值作为参数，返回值是一个对象，里面包含了它的type和要修改的对象的键值对
- type，可以理解为action的name，例如说有一个action是修改动作 所以它的type是update，type是用来作为参数传入reducer的时候判断是哪种行为
- value {key: value} key就是要修改的store里的key value就是新的值
such as
```javascript
    function onStateChange(value) {
        // TODO...
        return {
            type: '',
            value
        }
    }
```

## reducer
当`action`被触发后会自动的计算`state`的函数
可以理解为 `action`负责的是提交动作和提交的值
而reducer则根据提交的动作和提交的值对state进行处理
但严格来说不是修改原有的state 而是返回一个新的值；当提交action后不需要手动调用`reducer`会自动触发
`reducer`接收两个参数分别是 `state` 和 `action` 
- `state` store数据源
- `action` 是提交的动作
返回是一个新的内存空间
such as
```javascript
function reducer(state, action) {
    switch(action.type) {
        case 'onStateChange':
            return {
                ...state,
                theme: action.onStateChange
            }
        default:
            return state
    }
}
```
## react-redux
在react or react-native项目中使用redux，推荐使用react-redux

### Provider
使用`Provider`标签包裹根组件，将`store`注入到app框架中通过`props`传递到组件中
`<Provider store={store}><App/></Provider>`
被Provider包裹的组件 如果想要使用store中的数据，则该组件必须是被`connect`包装过的

### connect
- 引入
`import {connect} from 'react-redux'`
- 使用
```javascript
    connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])
```
- connect参数说明
    - mapStateToProps
        将store中的state数据传递到组件的props中，
    例如将store的count传递到某组件的props.count中`const mapStateToProps = state => {count: state.count}`
    - mapDispatchToProps
        将store中的action方法传递到组件的props中
    例如将store.action 中的onStateChange 传递到组件的props.func中 在组件中则可以通过 `this.props.func(value)`调用该方法
    `const mapDispatchToProps = dispatch => {func: value => dispatch(actions.onStateChange(value))}`
    - mergeProps
        将`mapStateToProps`或`mapDispatchToProps`的操作合并到组件的props中 通常这个参数不需要传递

- 导出merge后的组件
`export default connect(mapStateToProps)(ComponentName)`
