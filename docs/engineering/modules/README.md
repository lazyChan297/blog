# 模块化开发

- `commonJs`服务端js模块化开发的规范，使用同步加载的方式
- `requireJs`和`seaJs`是`esmodules`出现前，解决浏览器环境模块化开发的库
  - `AMD`是`requireJs`的规范产出，`AMD`推崇前置依赖，即提前加载模块
  - `CMD`是`seaJs`的规范产出，`CMD`推崇就近依赖，即运行时加载
- `esmodules`是es6对js模块化开发的统一，使其不再依赖`requireJs`和`seaJs`，在浏览器环境直接就可以支持

## 使用方式

### commonJs
- 导出方式1：给`module.exports`对象赋值，例如`module.exports = function Foo(){}`，当需要导出一个函数或数组的时候适用这种方式
- 导出方式2：给`module.exports`对象添加key值，例如`module.exports.Foo = function (){}`，当需要导出一个对象以键值对方式访问适用这种方式
- 导入：使用`require(路径)`
  - `require`的模块加载机制
    1. 计算模块路径
    2. 如果模块在缓存里面，取出缓存
    3. 加载模块
    4. 输出模块的`exports`属性
  - `require`的模块加载规则
    - 如果路径名中使用了`./`或`../`或者`/`会根据相对/绝对路径查找文件
    - 如果没有使用，则先查找node平台的核心模块->下载的第三方模块
**不可以直接对exports变量赋值，这样会切断当前模块与外部的连接**

### esmodules
- 以键值对形式导出`export {a,b,c}`以对象的数据格式导出模块，访问时通过对象的键名获取模块中对应的接口或方法，`import Obj from '路径'`，`Obj.a`
- 只导出单个模块`export default name`
- 按需导入，`import {a} from '路径'`
- 整体导入，`module name from '路径'`或者`import * as name from '路径'`

**注意**
- `import`加载会有变量提升作用
- `import`引入的模块是静态加载（编译阶段加载）而不是动态加载（运行时加载）
- `import`命令输入的变量都是只读的，因为它的本质是输入接口。也就是说，不允许在加载模块的脚本里面，改写接口
- `import`引入export导出的接口值是动态绑定关系，即通过该接口，可以取到模块内部实时的值

```js
// 模块输出
function fn1() {}
function fn2() {}
export {
	fn1, 
    fn2 as f2
}

// 部分加载,只会加载fn1方法，编译时加载
import { fn1 } from './a.js' // 

// 加载时支持重命名
import { fn1 as f1 } from './a.js'

// 整体加载 (使用import命令)
import * as whole from './a.js'
whole.fn1()
whole.fn2()

// 整体加载 (使用module命令)
module whole from './a.js'
whole.fn1()
whole.fn2()

// import加载会有变量提示作用
fn2()
// import会自动提示到顶部先加载
import { fn2 } from './a.js'

// 默认输出, 一个模块只能有一个默认输出
export default fn1;
// 加载默认输出的模块, 不需要{}，可以为模块自定命名
import anyName from './a.js'
```

### 模块加载的原理
ES6模块加载本质上是对值的引用，两个模块直接修改存在互相影响

```javascript
// a.js
export var myName = 'louis'
export const myAddress = {street: 'street', detail: 'address detail'}
setTimeout(() => myName = 'Louis', 1000)

// b.js
import {myName, myAddress} from './a.js'
console.log(myName) // louis
setTimeout(() => console.log(myName), 1000) // Louis
// 引入myAddress 可以理解为创建了 const myAddress
myAddress.number = 1 // 可以对引用的值添加属性方法
myAddress = {} // typeError 但不能修改加载的值的引用
```

## commonJs
commonJs的加载方式为同步加载且会加载整个引用的js文件，等待文件加载完毕才会往下执行
加载过的文件会缓存，通过module.loaded对象来识别
因为commonjs的加载方式是同步的，所以多用于node项目
### 使用方式

```javascript
// 输出 exports.js
fn1() {}
modulue.exports.fn1 = fn1

// 加载 require会加载整个js文件
const example = require('exports.js')
example.fn1()

// commonjs加载的文件会缓存，模块内部会有一个module对象 module.loaded标识是否加载过这个文件，是的话直接从module.exports里取出
const again = require('exports.js')
```

### 模块加载机制

**commonJS**的加载是对加载内容值的拷贝，外部引用不会对内部变量有影响

[1]: https://javascript.ruanyifeng.com/nodejs/module.html#toc13	"commonJS规范"

## AMD规范
由于AMD规范不是原生js支持的，所以使用AMD规范模块化开发需要引入requireJs库，支持异步加载，比较适合浏览器端开发使用

### 使用方式
```javascript
// 定义模块输出
define('example', [dependencies], function() {
  // 返回的对象为输出的内容
  return {}
})

// 加载模块
require(['example'], function() {})
```

## CMD规范

### 使用方式
CMD是国内定义的模块化开发规范，CMD也不是js原生支持的，所以使用CMD规范需要引入seajs 支持异步加载，比较适合浏览器端开发使用

## AMD和CMD区别
amd定义时就会加载模块，cmd在定义时不会加载，在实际使用时才会

