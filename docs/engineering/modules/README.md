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

### es6 modules
- 以键值对形式导出`export {a,b,c}`以对象的数据格式导出模块，访问时通过对象的键名获取模块中对应的接口或方法，`import Obj from '路径'`，`Obj.a`
- 只导出单个模块`export default name`
- 按需导入，`import {a} from '路径'`
- 整体导入，`module name from '路径'`或者`import * as name from '路径'`

**注意**
- `import`加载会有变量提升作用
- `import`引入的模块是静态加载（编译阶段加载）而不是动态加载（运行时加载）
- `import`命令输入的变量都是只读的，因为它的本质是输入接口。也就是说，不允许在加载模块的脚本里面，改写接口
- `import`引入export导出的接口值是动态绑定关系，即通过该接口，可以取到模块内部实时的值

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
