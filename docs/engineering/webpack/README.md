# Webpack

## 如何理解
webpack可以用来解决模块化开发的问题 <br/>
随着技术的发展开发过程中会用到es6语法，typescript，scss或less提高开发效率，或者.vue文件（使用vue框架的时候)，<br/>
打包工具可以帮助开发者将不同格式的文件打包成对应的js或 ss，也可以打包html文件<br/>
在开发过程中，webpack还开启热加载，提高开发效率<br/>
开发完毕，部署项目时webpack也可以代码压缩合并或者分包<br/>

## 构建流程
1. 从`shell语句中的参数`和`配置文件`中读取和合并配置参数得到`options`对象，该对象包含了入口配置，出口配置，plugins集合等等<br/>
然后根据`options`创建一个compile对象<br/>
2. complier执行complier.run()方法，构建流程开始，首先会创建一个`Compilation`对象，该对象提供了每个构建环节的方法，<br/>
例如`addEntry()`找到入口文件。同时包含了所有的module、chunk，还有asset、template
3. 开始构建模块，调用所有配置的loader对模块翻译得到js module，再根据js module生成ast，遍历ast，如果模块有依赖别的模块，则重复刚刚的构建步骤
4. 当模块构建完成之后，监听seal事件调用配置的插件对module和chunk整理，例如压缩、合并代码，最后得到一个个chunk文件
5. 接着根据不同的template生成不同的bundle文件。如果是入口文件会使用`mainTemplate`如果是异步加载的js会使用`chunkTemplate`，最后就得到可以在浏览器中运行的文件

实际上构建流程是很复杂的，以上只是基于各个关键节点的总结，详细了解可以看这篇<br/>
[细说 webpack 之流程篇](https://developer.aliyun.com/article/61047)
## 热更新原理
- 使用`webpack-dev-server`启动一个本地服务器
- 使用socket与浏览器保持长连接
- webpack负责监听文件的变化，每次保存文件时会根据文件内容生成hash值并发送给浏览器
- 浏览器得到hash值是否一致，如果一致使用原来的缓存，如果不一致向服务求请求更改后的资源（以jsonp的形式）

## 文件指纹
也就是打包后的文件名
- hash: 和整个项目有关，只要项目有修改，hash值就会改变
- Chunkhash: 和webpack打包的chunk有关，不同的entry会产生不同的chunkhash
- contenthash: 根据文件内容来定义hash，文件内容不变，hash不变

js文件用chuankhash，这样做可以使浏览器js文件缓存生效，提高性能<br/>
css文件（使用mini-css-extract-plugin分离打包)用contentHash，这样做css文件不受js文件改变影响导致缓存失效


