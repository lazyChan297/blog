# Webpack路由懒加载实现原理

## 懒加载流程
- js文件打包后的代码是webpackJsonp对象push一个数组元素，该数组包含两个元素，<br/>
`chunkId`，`由模块id和js文件源代码组成的键值对`<br/>
`window['webpackJsonp].push([[chunkId], {模块id: js文件源代码}])`

- 所以每次加载路由时会调用`webpackJsonp.push`，所以劫持`webpackJsonp`对象的push方法

- 当开始请求懒加载文件时，执行`__webpack__.require.e(chunk-xxx)`请求对应的js文件，<br/>
该方法会创建一个promises数组，并在`installedChunks`对象中添加当前`chunkId`的属性，
属性值为一个数组，第1项是resolve方法，第2项为reject方法，第3项为promise对象，
接着动态创建一个script标签加载js文件，然后返回Promise.all(promises)的对象

- 当读取到文件时，`webpackJsonp.push`被触发，执行`webpackJsonpCallback`，该方法会把加载文件时在`installedChunks`对象中定义的chunkId属性的第一个元素，也就是resolve方法取出执行，并把`installedChunks[chunkId]`标记为0，表示已经加载完成

- resolve执行后`__webpack__.require.e`被resolve，接着执行`then`回调，也就是执行`__webpack_require__.bind`，读取打包后的懒加载文件的moduleId里的源代码执行，加载完成

## 打包后的文件
以vue的路由懒加载为例，`component:() => import('./components/home.vue')`，该代码构建后是以下结构
```javascript
routes: [{
    path: '/home',
    component: function component() {
      // 2.先执行同步请求方法__webpack_require__.e()会返回一个promise对象
      return __webpack_require__.e(/* import() */ "chunk-2d216d34").then(__webpack_require__.bind(null, "c3b0"));
    }
}]
```

## 劫持webpackJsonp.push
通过劫持该方法，可以监听到每次加载完成js文件后执行后续的操作
```javascript
// app.js 
var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
// 绑定了jsonpArray原来的push方法
var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
// 1.劫持jsonpArray的push方法给webpackJsonpCallback
jsonpArray.push = webpackJsonpCallback;
jsonpArray = jsonpArray.slice();
for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
var parentJsonpFunction = oldJsonpFunction;
```

## 请求懒加载文件
`__webpack_require__.e`方法负责请求js文件<br/>
`installedChunks`对象负责保存加载过的chunk文件，
`installedChunks[chunkId]`： `0 => 加载完成` `undefined => 从未被加载` `promise对象 => 加载中`
```javascript
__webpack_require__.e = function(chunkId) {
  var promises = []
  var installedChunkData = installedChunks[chunkId]
  if (installedChunkData !== 0) {
    // 该chunk还没有被加载完成
    if (installedChunkData) {
      // 该chunk正在加载中, installedChunkData[2]还是pending状态的promise对象
      promises.push(installedChunkData[2])
    } else {
      // chunk还没有被加载过
      // 定义一个promise对象处理请求script后的异步回调
      var promise = new Promise((resolve, reject) => {
        // 把请求成功和失败的方法缓存的installedChunks，给webpackJsonpCallback使用
        installedChunkData = installedChunks[chunkId] = [resolve, reject]
      })
      promises.push(installedChunkData[2] = promise)
      // 创建script标签 一系列操作
      var script = document.createElement('script');
      // 拼接编译后的src路径 publicPath + '/js' + chunkId.. + '.js'
      script.src = jsonpScriptSrc(chunkId)
      // 加载错误
      script.onerror = function() {}
      script.timeout = 120 
      // 添加到body
     	document.head.appendChild(script); 
    }
  }
  return Promise.all(promises)
}
```

## 文件加载完成
当文件加载完成读取该文件，`webpackJsonp`的push方法触发，执行`webpackJsonp`<br/>
该方法负责把加载文件时定义的属性值`installedChunks[chunkId][0]`取出执行resolve<br/>
接着把`installedChunks[chunkId]`赋值为0，标记加载完成<br/>
当加载文件方法的promises数组里的对象全部被resolve，表示全部加载完成
```javascript
// <script src="./js/home.js"></script> 被加载完成后 home.js代码执行
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["chunk-2d216d34"],{
	// ...
}])
// window["webpackJsonp"].push被劫持, webpackJsonpCallback执行
function webpackJsonp(data) {
  var chunkIds = data[0]
  var moreModules = data[1]
  var moduleId, chunkId, i = 0, resolves = [];
  // 把installedChunks里对应的chunkId的resolve方法缓存
  for (;i < chunkIds.length; i++) {
    var chunkId = chunkIds[i]
    // 如果有记录加载当前的chunk和记录的值不为空
    if (Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
      // 此时已经加载完成,把上一步骤保存的resolve方法提取出来
      resolves.push(installedChunks[chunkId][0])
    }
    // 把当前chunk标记为已经加载完成
    installedChunks[chunkId] = 0
  }
  // 同样也缓存了module
  for (moduleId in moreModules) {}
  // 将异步请求的路由状态变更为resolve
  while(resolves.length) {
    resolves.shift()()
  }
}
```

## 执行文件中的代码
执行路由懒加载里的then回调 `then(__webpack_require__.bind(null, "c3b0"))`<br/>
读取加载到的文件里`{moduleId: 源代码}`中的源代码执行<br/>
```javascript
function __webpack_require__(moduleId) {
  // 模块已经被缓存,直接返回
 	if (installedModules[moduleId]) {
    return installedModules[moduleId].exports
  }
  // 模块没有被加载
  var module = installedModules[moduleId] = {
    i: moduleId,
    l: false,
    exports: {}
  }
  // 执行module里的function 也就是[['chunkIds'], {c3b0: function()}] c3b0的方法
  modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
  return module.exports;
}
```