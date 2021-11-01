# webpack
webpack能够处理模块的加载顺序、模块之间的依赖关系、将各种文件类型的资源翻译、使模块化开发的维护工作变得简单。同时支持开发模式下热加载、生产环境的代码压缩合并、懒加载等功能。

## 构建流程
**初始化** 
- 从`shell语句中的参数`和`配置文件`中读取、合并配置参数得到`options`对象，该对象包含了入口/出口文件名和路径配置，plugins集合，module的转换规则，然后传入`options`作为参数，创建一个webpack实例`complier`，该实例负责注册webpack的生命周期`编译前/编译中/编译后`等等

**编译**
- `compile`执行`run`方法，正式开始编译，该方法会触发compile方法返回一个Complication对象，该对象负责组织整个构建环节的流程，包含了构建和输出文件所对应的方法，同时保存了所有module和chunk，生成的asset
    - `Complication.addEntry()`，该方法负责入口文件，接着调用内部的`_addModuleChian()`
    
**创建模块**
- `_addModuleChian()`创建模块返回一个空的module对象，开始构建模块

**构建模块**
- 构建模块遇到不是`.js`或者`.json`文件时调用该文件类型配置的`Loader`，返回的是以字符串存储的js代码
- 调用acorn把loader返回的js代码解析成ast对象
- 遍历ast对象，遇到依赖其他模块时递归，重复创建模块的步骤，直到理清当前模块的依赖关系

**seal** 
该方法负责给每一个chunk绑定对应的module，一个chunk由一个或多个module组成。创建一个`chunk`对象，调用该对象的addModule方法添加模块

**输出文件** 确定了chunk和module之间的绑定关系后调用`createChunkAssets`方法最终生成asset，该方法会把构建模块中的ast对象分析，最终得到可以在浏览器运行的代码输出到dist中

## Loader
webpack默认只能打包js或json文件，对于其它资源需要通过`Loader`对内容进行翻译使webpack支持

**执行顺序** 默认情况下是从右到左，从下往上。每个loader可以导出一个pitch函数，pitch的执行顺序与loader相反，pitch有返回值则不会再调用配置文件中剩余的loader；pitch没有返回值，继续调用右边的loader的pitch方法。

**执行时机** 对应的module构建模块时执行

### 常用loader
- vue-loader 给`.vue`文件路径传入三个不同的参数，分别提取template、script、style内容对应转换
- css-loader 处理js代码中的`import`和`url()`、`@import`、`require`，变为一段字符串形式的js代码
- style-loader 将css-loader返回的js代码转换成真正的样式并以style标签挂载到html中
- url-loader 
    - 处理css中的静态资源`url(path)`。假如没有使用该loader，会以当前打包好的文件为`chunk-xxx.yyy.css`所在的路径为起点根据path的值查找静态资源。如果使用了该loader，配置了publicPath就会以publicPath为根路径+path的值查找，如果没有就会以dist目录为起点根据path的值查找。静态资源所在的文件路径也会以publicPath+path的值打包到对应的文件路径下
    - 转换文件格式为base64格式，同时可以设置阀值，对小于该阀值的文件转换大于的仅仅做url处理
- file-loader 和url-loader一样可以指定文件输出的名字和路径，但是不能做base64转换

## Plugins
丰富打包的功能，例如压缩，合并，体积分析，打包计时分析

**执行时机** 贯穿整个构建流程的生命周期，由webpack实例`complier`触发响应的勾子执行

### 常用plugins
- html-webpack-plugin 创建html文件，由`new HtmlWebpackPlugin()`创建实例返回
- clean-webpack-plugin 清除构建产物
- mini-css-extract-plugin 将css代码与js代码分离
- compression-webpack-plugin 压缩代码
```javascript
new compressionWebpackConfig({
    filename: '[path][base].gz', // 输出的文件名
    algorithm: 'gzip',
    test: new RegExp('\\.(' + 'js|css') + ')$'), // 匹配压缩的文件格式
    threshold: 10240, // threshold： 只有size大于该值的资源会被处理。单位是 bytes。默认值是 0。
    minRatio: 0.8 // minRatio： 只有压缩率小于这个值的资源才会被处理。默认值是 0.8。
})
```
- copy-webpack-plugin 将工程中的文件复制到dist目录下，例如favicon.ico
## 热更新
1. `webpack-dev-server`启动一个本地服务器并和浏览器之间建立了socket通信，保持长连接
2. webpack发送给浏览器两个文件，一个是代码打包后的js文件，以hash值命名；一个是json文件 {c: 文件路径,h: hash值}
3. 当webpack监听到文件变化后重新向浏览器发送更新了hash值的json文件和新的打包文件
4. 浏览器接收到新的文件后触发更新

## 文件指纹
也就是打包后的文件名
- hash: 和整个项目有关，只要项目有修改，hash值就会改变
- Chunkhash: 和webpack打包的chunk有关，不同的entry会产生不同的chunkhash，js文件用chuankhash，这样做可以使浏览器js文件缓存生效
- contenthash: 根据文件内容来定义hash，文件内容不变，hash不变，css文件（使用mini-css-extract-plugin分离打包)用contentHash，这样做css文件不受js文件改变影响导致缓存失效

## 路由懒加载实现原理
进入某一条路由时，浏览器才会向服务器请求该路由的js文件，该js文件是一个通过IIFE函数，该函数内部逻辑如下
`webpackJsonp.push([[chunkId],{moduleId:编译后的js代码}])`

当请求该路由文件时会调用`__webpack__.require.e(chunkId)`函数，该函数会在全局对象`installedChunks`中添加键名为chunkId的属性，属性值是一个数组对象，值分别是promise对象的resolve方法、reject方法、promise对象，最后返回一个`Promise.all[promises]`对象

当请求到chunk-chunkId.js文件后`webpackJsonp.push`方法执行，`webpackJsonpCallback`触发，取出全局对象`installedChunks[该文件的chunkId]`数组对象的第一个元素也就是resolve方法，`__webpack__.require.e`函数返回的promise对象状态变为fulfilled，执行它的then回调

then回调函数是`__webpack_require__.bind(null, moduleId)`，该方法创建一个module对象，i的值是moduleId，exports属性是路由懒加载文件的js源代码，并把该module对象添加到全局的installedModules对象中，最后返回module.exports，路由懒加载完成
[路由懒加载详细源码](/engineering/RouterLazyLoading/)

## 参考
1. [细说webpack之流程篇](https://developer.aliyun.com/article/61047)
