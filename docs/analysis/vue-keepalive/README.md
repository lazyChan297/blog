# keep-alive实现缓存原理

## 实现原理

::: tip 部分属性和函数说明
**keepAlive**: 渲染节点时通过vnode.data.keepAlive对象来处理该节点的缓存
**keys**: keepAlive.keys 保存需要缓存的组件的key
**cache**: 保存缓存节点vnode的对象，键名为key值，键值为vnode
**pruneCache**: 清空cache指定key的函数
:::

- 被keep-alive标签包裹的组件接收父组件传递的两个参数值`includes`和`exclude`数组来判断是否对组件缓存处理

- keep-alive在调用`mounted`生命周期时，监听includes和exclude变化，每当这两个值变化时根据includes和excludes判断来删除cache[key]
  -  获取与includes不匹配的值的key，遍历cache，如果cache里存在key，则删除cache[key]
  -  获取与excludes匹配的值的key 如果name与excludes的值匹配，删除cache[key]；
* keep-alive的render函数处理，
  * 如果当前的子组件name与include数组不匹配或者与exclude数组匹配则直接返回vnode；
  * 如果是缓存的组件，则返回cache[key]里的对象，并把原本keys里的key删除，重新push，调整缓存组件的序列；
  * 如果keys超出最大缓存数，则把第一个缓存的组件从cache里删除
* 当组件被destroyed时，清空cache里的所有组件

## 源码部分

```javascript
var KeepAlive = {
  name: 'keep-alive',
  props: {
    include: patternTypes, // 缓存的组件
    exclude: patternTypes, // 不缓存的组件
    max: [String, Number] // 最大缓存数
  },
  created: function created() {
    // 初始化时创建cache属性用来缓存组件
    this.cache = Object.create(null)
    this.keys = []
  },
  destroyed: function destroyed() {
    for (var key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },
  mounted: function mounted () {
    var this$1 = this;
		// 使用watch监听include和exclude 一旦变更，立刻更新缓存
    this.$watch('include', function (val) {
      // 删除与include不匹配的cache里的key
      pruneCache(this$1, function (name) { return matches(val, name); });
    });
    // // 删除与exclude匹配的cache里的key
    this.$watch('exclude', function (val) {
      pruneCache(this$1, function (name) { return !matches(val, name); });
    });
  },
  render: function render() {
    // 获取子组件
  	var vnode = getFirstComponentChild(slot);
    var componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      var name = getComponentName(componentOptions);
      var ref = this;
      var include = ref.include;
      var exclude = ref.exclude;
      // 组件名与exclude匹配or组件名与include不匹配，直接返回vnode
      if ( (include && (!name || !matches(include, name))) || (exclude && name && matches(exclude, name))) {
        return vnode
      }
    }
    // 如果vnode.key为空，key等于cid::tag 否则key=vnode.key
    var key = vnode.key == null
        ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
        : vnode.key;
    // 如果当前节点存在缓存直接返回缓存的值
    if (this.cache[key]) {
      vnode.componentInstance = cache[key].componentInstance;
      // 删除keys里对应的key，重新push，调整key的位置
      remove(keys, key);
      keys.push(key);
    } else {
      // 不存在则缓存当前节点
      this.cache[key] = vnode
      // 把当前key添加到keys数组记录
      keys.push(key)
      // 如果当前缓存的keys超出最大缓存数，删除第一个缓存的组件
      if (this.max && keys.length > parseInt(this.max)) {
        pruneCacheEntry(cache, keys[0], keys, this._vnode);
      }
      // 把当前组件keepAlive标记为true，以便于在patch的时候判断它是重新激活的组件
      vnode.data.keepAlive = true 把当前组件keepAlive标记为true
    }
    return vnode
  }
}
```

