# keep-alive实现缓存原理

## 实现原理
- 被keep-alive标签包裹的组件接收父组件传递的两个参数值`includes`和`exclude`数组来判断是否对组件缓存处理
- this.cache对象来记录要缓存的组件
- keys来记录缓存组件的key
- keep-alive在调用`mounted`生命周期时，监听includes和exclude变化，遍历cache缓存的组件获取name；
  * 如果name与includes的值不匹配，删除cache里对应的组件；
  * 如果name与exclude的值不匹配，删除cache里对应的组件
* keep-alive的render函数处理，
  * 如果当前的子组件name与include数组不匹配或者与exclude数组匹配则直接返回vnode；
  * 如果是缓存的组件，则返回cache[key]里的对象，并把原本keys里的key删除，重新push，调整缓存组件的序列；
  * 如果keys超出最大缓存数，则把第一个缓存的组件从cache里删除
* 当组件被destroyd时，清空cache里的所有组件

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
      pruneCache(this$1, function (name) { return matches(val, name); });
    });
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
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        // 子组件没有included的组件或者有不缓存的组件，直接返回vnode
        return vnode
      }
    }
    // 如果vnode.key为空，key等于cid::tag 否则key=vnode.key
    var key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
        : vnode.key;
    // 如果当前节点存在缓存直接返回缓存的值
    if (this.cache[key]) {
      vnode.componentInstance = cache[key].componentInstance;
      // make current key freshest
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

