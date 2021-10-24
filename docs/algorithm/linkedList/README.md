# 链表

## 链表反转
- 创建`prev`变量，初始值为null，缓存上一个节点
- 创建`current`遍历，指向当前节点
- 从head开始遍历，head指向`current`，在满足`current`不为空的条件下遍历
    - 取出当前节点的下一个节点next
    - 把当前节点的next指向上一个节点
    - 把prev更新为当前节点
    - 把当前节点更新为next
- 返回遍历结束后的`prev`则可以得到反转后的链表

```javascript
function reverseLinked(head) {
    let prev = null
    let current = head
    while(current) {
        let next = current.next
        current.next = prev
        prev = current
        current = next
    }
    return prev
}
```

## 回文链表
遍历链表把每一个节点取出保存到数组，再通过数组判断是否对称
```javascript
function isPail(head) {
    let array = []
    while(head) {
        array.push(head.val)
        head = head.next
    }
    let len = array.length
    let times = Math.floor(len/2)
    for(let i = 0; i < times; i++) {
        if (array[i] !== array[len - i - 1]) return false
    }
    return true
}
```
