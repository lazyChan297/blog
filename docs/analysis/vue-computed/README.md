# 计算属性源码解读

假设有计算属性sum,它依赖响应式对象a,求值函数如下；
```javascript
computed: {
    sum() {return this.a + 1}
}
```

## 计算属性初始化
### initComputed
对组件的computed对象进行初始化；
- 将计算属性初始化为watcher实例
- 劫持计算属性的get方法
```javascript
function initState() {
    if (opts.computed) { initComputed(vm, opts.computed); }
}
function initComputed (vm, computed) {
    for (var key in computed) {
        // 遍历计算属性初始化为watcher实例
        computed[key] = new Watcher()
        // 劫持计算属性的get和set方法
        defineComputed(vm, key, userDef);
    }
}
```
计算属性`new Watcher()`后结构如下
```javascript
{
    value: undefined, // Watcher构造函数中如果lazy为true，不会执行求值函数undefined
    dirty: true, // 决定缓存
    lazy: true,
    deps: [], 
    getter: function() {} // getter函数就是vue组件中的 sum() {this.a + 1} 
}
```

#### 劫持计算属性的get函数
调用`defineComputed`函数，劫持计算属性的get和set；
当访问计算属性时，如果dirty值为true会执行计算属性求值方法；收集依赖
```javascript
    // watcher为计算属性watcher
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        // 求值
        watcher.evaluate();
      }
      if (Dep.target) {
        // 收集依赖
        watcher.depend();
      }
    return watcher.value
```

### 计算属性求值
计算属性求值通过`watcher.evaluate()`方法实现；该方法会把Dep.target指向计算属性，收集计算属性的deps和求值，求值完毕后把Dep.target重新指向上一个watcher；
- 计算属性求值方法`watcher.evaluate()`代码如下
```javascript
 Watcher.prototype.evaluate = function evaluate () {
  // 触发计算属性的求值函数
  this.value = this.get();
  // 求值后把dirty重新设为false
  this.dirty = false;
};
```

### 计算属性收集依赖
访问计算属性时，除了会触发求值方法(dirty为true的情况下)，还会触发收集依赖 `watcher.depend()`
`watcher.depend()`方法遍历计算属性的deps执行depend，其实就是 Dep.target.depend()，也就是watcher.addDep()
```javascript
    // watcher.depend()
    Watcher.prototype.depend = function depend () {
        var i = this.deps.length;
        while (i--) {
            // 1遍历计算属性deps 响应式对象收集依赖
            this.deps[i].depend();
        }
    };
    // 2 响应式对象收集依赖
    Dep.prototype.depend = function depend () {
        if (Dep.target) {
            // 本质上是调用了watcher的addDep方法，此时的dep是a的dep
            Dep.target.addDep(this);
        }
    }
    // 3 
    Watcher.prototype.addDep = function addDep (dep) {
        var id = dep.id;
        // 此处做了去重优化
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id);
            // 把响应式对象的dep添加到计算属性的deps中
            this.newDeps.push(dep);
            if (!this.depIds.has(id)) {
                // 把当前watcher 也就是计算属性watcher添加到响应式对象的subs中
                dep.addSub(this);
            }
        }
    }
```
### 小结
1. 当渲染模版访问计算属性时，新建渲染模版watcher，此时Dep.target为渲染模版watcher；
2. 渲染模板访问sum，触发了计算属性的get劫持函数
3. 计算属性的get劫持函数执行求值方法，把Dep.target为计算属性watcher，
    - 求值方法执行过程中，触发了`a`的依赖收集，执行dep.depend()， dep.depend() 触发 Dep.target.addDep()，触发 计算属性watcher.addDep()
    - 计算属性watcher.addDep()把`a` 添加到deps中，`a`的dep把计算属性watcher添加到subs中
4. 计算属性求值方法执行完毕，`popTarget()`把Dep.target重新赋值为渲染模板watcher
5. 计算属性收集依赖执行watcher.depend()；遍历计算属性watcher的deps执行第`3`步的dep.depend()，所以`a`的subs为[sum,渲染模板]

## 计算属性更新
当`a`修改时，`dep.notify()`通知sum和渲染watcher执行update方法

## 计算属性缓存的原理
作为计算属性被实例化的watcher，dirty的初始值为true，表示该属性为脏数据；当访问计算属性时，如果是脏数据才会执行求值方法，否则会直接返回`value`；
当计算属性的deps修改时，会触发watcher.update()，update方法就会把dirty标记为true
当依赖计算属性的watcher访问时，dirty为true就会重新求值获得新的计算属性并把dirty修改为false，所以当计算属性的deps没有被修改时，依赖计算属性的watcher求值一次后把dirty标记为true，则不会再进行求值，从而实现缓存，直到deps再次修改；

