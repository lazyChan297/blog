# 白屏现象
分为白屏异常和白屏时间过长，前者是稳定性问题，后者是性能方向的问题

**可能导致白屏异常的原因**
- **CDN**  
    - 比如把依赖的框架不随着项目打包而是使用CDN引入，当CDN链接失效时导致导入文件不存在
    - 解决方式：将CDN文件上传到自己的服务器，在服务器建立CDN目录
- **缓存** 
    - 当项目发版后，客户端可能缓存了上一个版本的文件，所以导致失效
    - 解决方式：可以给css和js文件打包时增加版本号例如当前时间戳`new Date().getTime()`，使浏览器缓存失效
- **js加载失败造成的渲染异常** 
    - 打包时文件路径错误或者是服务器中不存在该资源，而页面的渲染又依赖这些js文件的话就会造成渲染异常
- **js代码不兼容**
    - 来自第三方库，以`vue-cli`举例来说，默认只对开发中的代码转换成es5，`useBuiltIns:'usage'`只根据源代码中出现的语言特性按需引入`polyfill`，当第三方库使用了es6+代码同时需要引入`polyfill`时`vue-cli`是检测不到的，所以会造成js代码不兼容，常见于低版本ios系统；或者第三方库使用了`commonJs`，而babel是默认处理es6的module类型的，这时候也会导致转换失败
    - 解决方式：在babel配置文件的`overrides`数组中，对指定的第三方库的指定明确的类型处理
        ```javascript
        module.exports = {
            overrides:[
                {
                    include: 'xxx',//第三方库路径
                    sourceType: 'unambiguous' // 明确的转换类型
                }
            ]
        }
        ```
- **js代码错误**

**监控方式**
以vue为技术栈的项目，可以在`window.onload`中监听关键dom节点`#app`有没有被挂载，如果被挂载了设置一个定时器2s后去判断节点中有没有内容

**可能导致白屏时间过长的原因**
- DNS查询
- tcp连接
- 请求资源文件的下载（html、css、js）

**监控方式**
在`window.onload`函数中，封装一个方法获取`window.performance.timing`，该对象就非常详细的记录了浏览器各个时间节点
```javascript
function getPerformance(timing) {
    let obj = {
        DnsTime: timing.domainLookupEnd - timing.domainLookupStart,
        tcpTime: timing.connectEnd - timing.connectStart,
        // 白屏时间
        whiteScreenTime: timing.domLoading - timing.fetchStart
        // 有效内容绘制时间
        firstScreenTime: timing.domContentLoadedEventEnd - timing.fetchStart
    }
    return obj
}
```