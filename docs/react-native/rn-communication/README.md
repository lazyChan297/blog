# 原生与js的通信

## 通信原理
**项目初始化**<br/>
1. 原生端通过遍历开发者自定义的原生模块和rn框架需要的原生模块，一起注册到原生模块映射表。同时定义需要用到的js接口到js模块映射表。
js模块的接口只定义了模块名和方法名和入参，并不包含执行逻辑
2. 原生端通过jsc将这两个映射表传递给js
3. js得到原生模块映射表，遍历该表把原生模仿挂载到nativeModule对象中；js得到js模块映射表，将所有的js模块实例注册到js模块映射表

**原生端向js通信**
1. 初始化后，原生端通过查找js模块映射表，找到需要调用的模块名和方法名
2. 将需要调用的信息传递给jsc，由jsc转发给js
3. js根据jsc传递过来的信息找到对应的模块名和方法名执行

**js向原生端发起通信**
1. 通过初始化时得到的原生模块映射表，使用jsc转发需要调用的模块名和方法名
2. jsc将转发消息进一步发送给原生端，原生端执行对应的方法
3. 根据定义的方法判断，如果需要回传和执行回调，则再由jsc将执行后的结果或回调id传给js

## 向js传递原生信息的几种方案
1. 直接向原生模块发起通信
js端通过`NativeModules.NativeInfoModule.getNativeInfo().then(info => {})`获取原生信息模块，
但是期间js向原生发起通信运行的链路是很长的，如果需要将原生信息发起网络请求，那么很有可能还没获取到信息就已经发起请求

2. 初始化根视图时把原生信息传递给props
```java
    props.putString("nativeInfo", nativeInfo)
    reactRootView.startReactApplication(
        getReactNativeHost().getReactManInstanceManager(),
        props, ///
    )
```
这个方案会时页面初始化时就已经得到原生信息，不需要考虑时机问题，但是有一个弊端是如果项目有多个视图入口，
那么需要在每一个`reactRootView`初始化时都携带原生信息，这样会增加一定的维护成本

3. 通过`NativeEventEmitter`
在js端注册监听器
```javascript
const emitter = new NativeEventEmitter(NativeInfoModule);
emitter.addListener('NativeInfoEvent', (data) => {

})
```

在原生端触发
```java
    reactInstanceManager.getCurrentReactContext().getJavaScriptModule().emit('NativeInfoEvent', nativeInfo)
```
这个方法需要注意的是只有当js端注册了监听事件，原生端的触发才会回传到js中

4. 将原生信息挂载到js的全局global对象下
通过`setGlobalVariable`可以把对象挂载到global中
```java
    onReactContextInitialzed(ReactContext context) {
        context.getCatalystInstance().setGlobalVariable('nativeInfo', nativeInfo)
    }
```
这个方法是jsc桥接时就会把对象挂载，但是在浏览器调试时会导致global对象时undefined