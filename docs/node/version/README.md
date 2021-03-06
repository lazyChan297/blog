# npm包的版本管理

## 版本号规则
包版本通常有三个数字组成，`[主要版本后.次要版本号.补丁版本号]`<br/>
版本号前没有符号表示精确匹配到该版本，<br/>
如果有，大多数与字面意思相同，例如`>=`，`<=`等等，<br/>
特殊的是`^`和`~`和`*`，<br/>
- `^`，兼容主要版本号，例如`^1.0.0`可以兼容到 `>=1.0.0 < 2.0.0`的版本
- `~`，兼容次要版本号，例如`~1.2.0`可以兼容到 `>=1.2.0 <1.3.0`的版本
- `*`，替代版本号，例如`1.*.*`可以兼容到`>= 1.0.0 < 2.0.0`的版本
- `-`，区间版本号，例如`1.0.0 - 2.0.0` 可以兼容到`>= 1.0.0 <= 2.0.0`的版本

## 管理版本冲突
假如项目中引入了A包版本号是`1.0.0`，同时引入B包，B包依赖版本号是`2.0.0`的A包，<br/>
npm会根据以上需求，在目录中添加了A版本号是1.0.0，在B中的`node_modules`引入了版本号是2.0.0的A
当打包时webpack会根据npm包的查找规则，就近查找到B的`node_modules`中的2.0.0版本的A，<br/>
同时也打包了1.0.0的A