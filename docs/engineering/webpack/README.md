# webpack

## 如何理解webpack
webpack可以用来解决模块化开发的问题；
随着技术的发展开发过程中会用到es6语法，typescript，scss或less提高开发效率，或者.vue文件（使用vue框架的时候),
打包工具可以帮助开发者将不同格式的文件打包成对应的js 或 css，也可以打包html文件;
在开发过程中，webpack开启热加载，提高开发效率
开发完毕，部署项目时webpack也可以代码压缩合并或者分包

## 构建流程
1. 从shell语句和配置文件中读取和合并配置参数
2. 初始化complier对象，加载所有的配置插件，执行complier.run()
3. 根据entry指定的入口文件，调用所有配置的loader对模块翻译，再找出该模块依赖的模块递归加载翻译
4. 所有loader翻译完模块后，得到每个模块的内容以及它们之间的依赖关系
5. 根据入口和模块之间的依赖关系组成一个个chunk文件，再把chunk转换成一个个单独的文件，也就是chunk.xx.js
6. 确定后输出内容后，根据配置文件的output输出内容把文件写入系统

## Loader
::: tip
- 作用: 负责把各类型文件打包到指定的目录or指定的输出类型
- 注意事项: 因为loader是资源的转换所以必须串行执行，执行顺序是从右到左，从下到上，也可以通过以下配置更改loader的优先级 `enforce`, pre（前置）、normal（默认，权重不变）、inline、post（后置）
:::

### 常用Loader
- babel-loader 
    将ES6+代码转换为ES5
- url-loader 
    将图片转为base64，可以加一个阀值判断
- file-loader

## plugin
::: tip
- webpack的插件机制，作用是在构建过程中通过插件丰富打包的功能；
- 执行顺序与loader不同，
:::

## 热更新原理

## 文件指纹
也就是打包后的文件名
- hash: 和整个项目有关，只要项目有修改，hash值就会改变
- Chunkhash: 和webpack打包的chunk有关，不同的entry会产生不同的chunkhash
- contenthash: 根据文件内容来定义hash，文件内容不变，hash不变

js文件用chuankhash，这样做可以使浏览器js文件缓存生效，提高性能
css文件（使用mini-css-extract-plugin分离打包)用contentHash，这样做css文件不受js文件改变影响导致缓存失效

## 常用loader
- file-loader
把多个文件输出到一个文件夹下，在代码中通过相对路径去引用输出的文件

- url-loader
把图片/媒体文件/字体文件通过base64形式编码输出,可以设置文件阀值，如果大于该阀值会转用file-loader

