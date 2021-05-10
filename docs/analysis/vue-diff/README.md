# diff算法流程

## patch机制
<img :src="$withBase('/diff.jpg')" alt="foo">

## vue就地复用策略
如果数据项的顺序被改变，Vue将不是移动 DOM 元素来匹配数据项的顺序，
而是简单复用此处每个元素，并且确保它在特定索引下显示已被渲染过的每个元素

## 为什么v-for时需要加入key
diff操作的时候createKeyToOldIdx函数可以直接通过key定位新旧vnode进行比较，可以更快速定位
设置key则不会使用就地复用策略，可以避免了一些依赖子组件状态的组件更新时会出现的bug

## 为什么不要使用index作为key
diff操作中判断是否相同节点函数`sameVNode`函数会根据key值来比较
假如列表123的key值是index -> 0 1 2
当对列表进行reverse的时候变为 3 2 1 index作为key仍然是0 1 2
diff的时候sameVNode(1,3)和sameVNode(3,1)都会返回true进入patchNode，所以多了很多无谓的dom操作