# 预加载
rn启动时间很大一部分取决于`Bridge`的创建，jsBundle文件的大小也直接影响创建的时间
预加载方案就是通过减少jsBundle文件体积，从而减少`Bridge`时长。


## 确定预加载的模块
首先确定哪些模块是首屏渲染时需要的，这些模块就是需要预加载的<br/>
在入口文件index.js中添加以下代码判断，获取首次加载需要的模块，然后把模块名输出到packager/modulePaths.js中
```javascript
    const modules = require.getModules();
    const moduleIds = Object.keys(modules);
    // 首次加载需要的模块
    const loadedModuleNames = moduleIds
        .filter(moduleId => modules[moduleId].isInitialized)
        .map(moduleId => modules[moduleId].verboseName);
    const waitingModuleNames = moduleIds
        .filter(moduleId => !modules[moduleId].isInitialized)
        .map(moduleId => modules[moduleId].verboseName);
```

## 修改metro配置文件
```javascript
const modulePaths = require('./packager/modulePaths');
const resolve = require('path').resolve;
const fs = require('fs');
const config = {
  transformer: {
    getTransformOptions: () => {
      const moduleMap = {};
      modulePaths.forEach(path => {
        if (fs.existsSync(path)) {
          moduleMap[resolve(path)] = true;
        }
      });
      return {
        preloadedModules: moduleMap,// 需要预加载的模块
        transform: { inlineRequires: { blacklist: moduleMap } },
      };
    },
  }
};

module.exports = config;
```