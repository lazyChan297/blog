# diff算法
<!-- 
## patch机制
<img :src="$withBase('/diff.jpg')" alt="foo"> -->

## 比较差异的过程
vue的diff算法是基于数据更新前后，两个虚拟dom结构的tree进行比较。<br/>
找出差异然后定位再执行`patch`更新真实的Dom。
出于视图中很少会出现跨层级移动视图，所以vue的diff算法选择了深度优先，同级比较的策略。


### 同层级比较
1. 新节点存在，旧节点不存在，证明为新增节点，调用`insert`
2. 新节点不存在，旧节点存在，证明为删除节点，调用`removeNode`
3. 新老节点都存在，调用`sameVNode(a, b)`方法判断是否为相同的节点<br/>
同一节点比较的策略是`key`&`tag`&`isComment`&`input的type类型`&`新旧节点的data都不为null和undefined`,
满足以上条件则判断为相同节点
```javascript
function sameVNode(a, b) {
    return (
        a.key === b.key && (
            (
                a.tag === b.tag &&
                a.isComment === b.isComment &&
                isDef(a.data) === isDef(b.data) &&
                sameInputType(a, b)
            ) || (
                isTrue(a.isAsyncPlaceholder) &&
                a.asyncFactory === b.asyncFactory &&
                isUndef(b.asyncFactory.error)
            )
        )
    )
}
```

### patchVNode
如果新旧的节点相同则对两个节点进行`patchVNode`比较
- 如果新节点存在text节点，和旧节点的text对比，如果不同则更新text，patch结束
- 如果新节点不存在text节点，判断是否新旧节点都存在子节点，如果同时存在且不想等，对子节点进行更新比较
- 如果仅有新节点存在子节点，则添加子节点，同时判断如果旧节点存在文本节点则清空
- 如果只有旧节点有子节点，删除旧节点的子节点，同时判断如果旧节点存在文本节点则清空


```javascript
    function patchVnode (
        oldVnode,
        vnode,
        insertedVnodeQueue,
        ownerArray,
        index,
        removeOnly
    ) {
    const oldCh = oldVnode.children
    const ch = vnode.children
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) {
        if (process.env.NODE_ENV !== 'production') {
          checkDuplicateKeys(ch)
        }
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        removeVnodes(oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text)
    }
```

### updateChildren
对比两个子节点列表时，两个列表分别创建两个指针指向头尾，这样每次遍历时可以头尾两两比较
每次遍历后向中间移动，直到列表里的头尾指针相遇，遍历结束。

**循环的条件**
newStartIdx小于等于newEndIdx且oldStartIdx小于等于oldEndIdx

**每次遍历时，进行比较**
1. `新子节点首位和旧子节点首位`是同一个节点，对他们进行patch，两个列表的StartIdx都向右移动
2. `新子节点末位和旧子节点末位`是同一个节点，对他们进行patch，两个列表的EndIdx都向左移动
3. `新子节点首位和旧子节点末位`是同一个节点，对他们进行patch，新StartIdx都向右移动，旧EndIdx向左移动
4. `新子节点末位和旧子节点首位`是同一个节点，对他们进行patch，新EndIdx都向左移动，旧StartIdx向右移动
5. 两两比较都不相同后，执行`createKeyToOldIdx`返回旧子节点key和节点元素的map对象`oldKeyToIdx`，<br/>
判断map对象里有没有是新子节点newStartVnode.key值的节点，如果有取出旧子节点里和新节点相同key的节点进行比较，<br/>
如果是同一个节点，对他们进行patch，新StartIdx向右移动，如果没有则新增该节点。
该map对象会缓存，下一次遍历时则可以根据`key`直接找到对应的元素

**遍历结束后**
1. 如果旧子节点的startIdx大于endIdx，证明有新增节点，新增的是`newStartIdx`到`newEndIdx`的节点
2. 如果新StartIdx大于新endIdx，证明有删除节点，删除的是`oldStartIdx`到`oldEndIdx`的节点

源码分析<br/>
```javascript
    function updateChildren (parentElm, oldCh, newCh,) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
  }

```
## 唯一标识key
**为什么v-for时需要加入key？**
diff操作的时候createKeyToOldIdx函数可以直接通过key更快速定位新旧vnode进行比较


**为什么不要使用index作为key？**
diff操作中判断是否相同节点函数`sameVNode`函数会根据key值来比较<br/>
假如列表123的key值是index -> 0 1 2<br/>
当对列表进行reverse的时候变为 -> 3 2 1 index作为key仍然是0 1 2<br/>
diff的时候会认为新节点的3和旧节点的1是相同节点，接着对这两个节点进行patch<br/>
但是此时节点的值已经发成了改变，patch机制就会判断该组件以及更新了，从而执行update，视图重新渲染。

