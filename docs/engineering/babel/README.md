# babel
::: tip 官方说明
babel是将es2015+语法编写的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。
babel可以进行语法转换；通过polyfill方式在当前环境添加新特性；源码转换
::: 

## babel的配置
在项目根目录下新建babel.config.js进行配置


## babel转换的流程
接收代码，进行parse，生成ast；使用traverse，根据插件的配置和预设的包进行节点的修改，最后使用generate生成可以在浏览器运行的代码
- babel核心包
    - babel-core 转译器本身，拆分为三个模块parse，traverse，generator
    - babel-parse 接受源码，进行词法分析、语法分析，生成AST
    - babel-traverse 接受一个AST，并对其遍历，根据preset、plugin进行逻辑处理，进行替换、删除、添加节点
    - babel-generator 接受最终生成的AST，并将其转换为代码字符串，同时此过程也可以创建source map
- babel工具包
    - babel-cli 可以使用babel xxx.js 直接将该文件的代码转换
    - babel-node 可以转换nodejs中require的文件

## babel的配置
根目录下的`babel.config.js`支持配置presets(预设插件集)和插件
### presets
例如代码中有箭头函数，那么就需要用到`@babel/plugin-transform-arrow-functions`，但是实际开发中不可能对应一个语法就配置一个插件，所以有了预设插件集
```javascript
module.exports {
    presets: [
        [
            "@babel/preset-env", // 使用的插件集包名，preset-env最常用因为可以包含了绝大部分es6的语法
            {
                "debug": true, // 默认是 false 开启后控制台会看到 哪些语法做了转换，Babel的日志信息，开发的时候建议开启
                // 配合@babel/polyfill使用
                "useBuiltIns": false, // 默认是false，entry：项目中 main.js 主动引入 @babel/polyfill；usage：只会把用到的polyfill按需引入
                // 指定转换的环境，以下代码意思是市场份额大于百分之1，最新的两个版本，不兼容ie8
                "targets": ["> 1%", "last 2 versions", "not ie <= 8"],
                // targets的另一种配置方式
                "targets": {
                    "esmodules": true, // 使用es6模块标准引入导出
                    "modules": "auto", // 默认值auto，
                    "node": true // 兼容当前node版本的代码
                }
            }
        ]
    ]
}
```

### plugins
plugins是代码transforming阶段用到的插件，如果不使用插件那么代码会原样输出

### polyfill
babel只会对es6语法进行转换，但是对es6特有的api是不会进行转换的，babel-polyfill的存在就是为了解决这个问题。但是babel-polyfill的文件体积非常大而且会全部引入，所以需要配置preset-env的useBuiltIns的参数为usage使它按需引入；
polyfill会引入新的原生对象和api到全局环境，把所有的方法都加到原型链上，所以会造成全局污染

### runtime
runtime插件的使用可以解决polyfill的全局污染；
**babel-runtime**本质上是对babel-runtime/core-js，babel-runtime/regenerator，babel-runtime/helpers的封装
- core-js 是对es6提供的api更细化，例如`core-js/fn/set`仅仅包含了set数据结构相关的内容
- regenerator generator/yield 和 async/await 的支持
- helpers babel需要用到的辅助函数例如`classCallCheck`
**plugin-transform-runtime**是根据代码实现对babel-runtime的引用并不会向polyfill那样造成全局污染，例如
```javascript
var sym = Symbol()
// 通过plugin-transform-runtime转换
var _symbol = require("babel-runtime/core-js/symbol");
var sym = (0, _symbol.default)();
```
@babel/plugin-transform-runtime是依赖于babel-runtime使用的，所以需要在package.json的dependencies中定义babel-runtime

### 最终babel配置
```javascript
module.exports = {
  // 配置预设插件集
  presets: [
      '@babel/preset-env', {}
  ],
  // 配置插件
  plugins: [
      [
        "@babel/plugin-transform-runtime",
        {
            "corejs": 2 // 参考官方文档
        }
    ]
  ]
}
```

## 项目中使用babel
使用babel-loader实现在项目打包过程中转译，一般是在代码压缩前;
因为babel转译需要一定时间，可以通过exclude排除node_modules目录或者includes:src进行转换；
options的配置项等同于babel.config.js里的配置项
```javascript
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [require('@babel/plugin-transform-object-rest-spread')]
        }
      }
    }
  ]
}
```