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
遍历链表把每一个节点取出保存到数组，再通过数组判断是否是回文结构
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

## 链表每k个一组反转
将给出的链表中的节点每 k 个一组翻转，返回翻转后的链表。如果链表中的节点数不是 k 的倍数，将最后剩下的节点保持原样
```javascript
function reverseKGroup( head ,  k ) {
    let newHead = new ListNode(-1)
    newHead.next = head
    // 已反转部分
    let prev = newHead
    while(head) {
        // 每k个为一组的区间中最后一个节点
        let tail = prev
        for(let i = 0; i < k; i++) {
            tail = tail.next
            // 链表剩余长度小于k，直接返回
            if (!tail.next) return newHead.next
        }
        // 剩余没有反转的部分
        let next = tail.next
        // 对k区间进行反转
        [head, tail] = reverse(head, tail)
        // 反转后拼接，prev.next指向反转后的头部
        prev.next = head
        // 反转后的尾部 tail.next指向剩余没有反转的部分
        tail.next = next
        // 已反转部分更新为当前反转区间最后一个节点tail
        prev = tail
        // 更新下一个开始反转的更新为已反转区间最后一个节点的下一个tail.next
        head = tail.next
    }
    return newHead.next
}
// 链表反转
function reverse(head, tail){
    let prev = null
    let cur = head
    while(prev !== tail) {
        [cur.next, prev, cur] = [prev, cur, cur.next]
    }
    return [tail, head]
}
```

## 链表指定区间反转
将一个节点数为 size 链表 m 位置到 n 位置之间的区间反转，要求时间复杂度 O(n)，空间复杂度 O(1)
```javascript
function ListNode(x){
    this.val = x;
    this.next = null;
}
function reverseBetween( head ,  m ,  n ) {
    let newHead = new ListNode(-1)
    newHead.next = head
    // 等待反转区间的前面部分的最后一个节点，用于反转后与区间连接
    let prev = newHead
    // 等待反转区间的第一个节点，从它开始反转
    let cur = head
    for(let i = 0; i < m-1; i++) {
        prev = prev.next
        cur = cur.next
    }
    // 区间反转，并与区间的前后部分连接
    for (let j = 0; j < n-m; j++) {
        // next永远指向cur的下一个节点，会随着cur变化而变化，所以next在遍历结束后会变成等待反转区间的最后一个元素
        let next = cur.next
        // 反转后区间第一个节点要指向最后一个元素的next
        cur.next = next.next
        // 反转后元元素替代链表前部分的next也就是cur,链表前部分的next指向变为最后一个元素
        next.next = prev.next
        prev.next = next
    }
    return newHead.next
}
```

## 返回链表倒数第k个节点
输入一个长度为 n 的链表，设链表中的元素的值为ai ，返回该链表中倒数第k个节点
`遍历链表获取长度len，len-k个节点next就是目标节点`
```javascript
function FindKthToTail(head, k) {
    let cur = head,len = 0
    while(cur) {
        cur = cur.next
        len++
    }
    cur = head
    // 链表长度不符合
    if (len < k) return null
    for (let i = 0; i < len-k; i++) {
        cur = cur.next
    }
    return cur
}
```

## 两个链表的第一个公共结点
输入两个无环的单向链表，找出它们的第一个公共结点，如果没有公共节点则返回空。
`定义两枚指针遍历两个链表，每次更新为当前节点的next，如果两个链表的长度不同，那么将当前节点的next执行另一个链表的head，直到两枚指针指向的值相同`
```javascript
function FindFirstCommonNode(pHead1, pHead2) {
    let p1 = pHead1, p2 = pHead2
    while (p1!==p2) {
        p1 = p1 ? p1.next : pHead2
        p2 = p2 ? p2.next : pHead1
    }
    return p1
}
```

## 判断链表中是否有环
判断给定的链表中是否有环。如果有环则返回true，否则返回false。
`链表有环指的是后面其中一个节点的next指向它前面的某一个节点，如果链表有环，快慢指针会在环中的某一个节点相遇`
```javascript
function hasCycle(head){
    if (head === null || head.next === null) return false
     let fast = head, slow = head
    while(fast !== null && fast.next!== null) {
        fast = fast.next.next
        slow = slow.next
        if (fast === slow) return true
    }
    return false
}
```

## 链表中环的入口结点
给一个长度为n链表，若其中包含环，请找出该链表的环的入口结点，否则，返回null。
`链表有环指的是后面其中一个节点的next指向它前面的某一个节点`<br/>
`使用双指针遍历，快针每次移动2个位置，慢针每次移动一个位置，如果链表有环，快慢指针会在环中的某一个节点相遇，此时定义慢针2从head开始，与慢针一起移动，当两枚慢针相等时则是环的入口，如果快针遍历结束还没有遇到入口则代表链表无环`
```javascript
function EntryNodeOfLoop(head){
    let fast = head, slow = head
    while(fast) {
        fast = fast.next.next
        slow = slow.next
        if (fast === slow) {
            let slow2 = head
            while (slow2 !== slow) {
                slow = slow.next
                slow2 = slow2.next
            }
            return slow2
        }
    }
    return null
}
```

## 单链表排序
`遍历链表将值保存到数组，遍历数组重组链表`
```javascript
function sortInList( head ) {
    let cur = head, arr = []
    while(cur) {
        cur = cur.next
        arr.push(cur.val)
    }
    // 排序
    arr.sort((a,b) => a-b)
    cur = head
    for (let i = 0; i < arr.length; i++) {
        cur.val = arr[i]
        cur = cur.next
    }
    return head
}
```
## 合并两个排序的链表
`创建一个head作为合并后链表的head，一个current指针指向新链表当前节点，随后遍历两个链表比较它们当前节点的值，较小的值添加到新链表中，current.next等于较小的值，然后更新新链表的指针，current更新为current.next`
```javascript
function ListNode(x){
    this.val = x;
    this.next = null;
}
function Merge(p1, p2){
    let head = new ListNode(null)
    let current = head
    while(p1&&p2) {
        if (p1.val <= p2.val) {
            current.next = p1
            current = current.next
            p1 = p1.next
        } else {
            current.next = p2
            current = current.next
            p2 = p2.next
        }
    }
    // 取出较长链表剩余的节点拼接
    if (p1) {
        current.next = p1
    } else {
        current.next = p2
    }
    return head.next
}
```

## 删除链表的倒数第n个节点
给定一个链表，删除链表的倒数第 n 个节点并返回链表的头指针
`遍历链表，得到链表长度，根据长度和n找出目标节点的索引值。再次从头遍历到索引值-1位置，找出删除目标节点的前一个值cur，cur.next = cur.next.next指向指向目标的下一个值，实现删除`
```javascript
function removeNthFromEnd( head ,  n ) {
    // write code here
    if (!head) return null
    let len = 0
    let current = head
    // 获取链表长度
    while(current) {
        current = current.next
        len++
    }
    // 删除目标节点的索引值
    let index = len - n
    // 更新current为head
    current = head
    // 删除头部
    if (index === 0) {
        return head.next
    }
    // current为删除目标节点的前一个值
    for (let i = 0; i < index -1; i++) {
        current = current.next
    }
    // 删除节点
    current.next = current.next.next
    return head
}
```

## 删除链表中的重复元素
删除给出链表中的重复元素（链表中元素从小到大有序），使链表中的所有元素都只出现一次
```javascript
function deleteDuplicates( head ) {
    // write code here
    if (!head) return head
    let cur = head
    while (cur.next) {
        if (cur.next.val === cur.val) {
            cur.next = cur.next.next
        } else {
            cur = cur.next
        }
    } 
    return head
}
```
## 两个链表生成相加链表
假设链表中每一个节点的值都在 0 - 9 之间，那么链表整体就可以代表一个整数。
给定两个这种链表，请生成代表两个整数相加值的结果链表。
`对两个链表反转，接着遍历相加，得到结果后再次反转`
```javascript
function addInList( head1,  head2 ) {
    // write code here
    if (!head1) return head2
    if (!head2) return head1
    
    // 先对链表进行反转，反转后从末位相加
    head1 = reverse(head1)
    head2 = reverse(head2)
    let head = new ListNode(-1)
    // 记录进位的数值
    let prev = 0
    let cur = head
    while (head1 || head2) {
        let val = prev
        if (head1) {
            val += head1.val
            head1 = head1.next
        }
        if (head2) {
            val += head2.val
            head2 = head2.next
        }
        // 整除10且不等于0进1，否则为Math.floor(val/10)
        prev = val%10 === 0 && val !== 0 ? 1 : Math.floor(val/10)
        cur.next = new ListNode(val%10)
        cur = cur.next
    }
    // 可能存在遍历后还有进位没有处理，判断prev是否等于0决定
    if (prev !== 0) cur.next = new ListNode(prev)
    // 求值后再次反转链表得到最终结果
    return reverse(head.next)
}
// 反转链表
function reverse(head) {
    let cur = head, prev = null
    while(cur) {
        let next = cur.next
        cur.next = prev
        prev = cur
        cur = next
    }
    return prev
}
```