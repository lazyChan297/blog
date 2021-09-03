# linkedList

## constructor
```javascript
    class LinkedList {
        constructor() {
            this.count = 0
            this.head = undefined
            this.equals = equals
        }
    }
    class Node {
        constructor(element) {
            this.element = element
            this.next = undefined // 节点的指针
        }
    }
    function equals(a, b) {
        return a === b
    }
```

## push
从链表尾部添加节点，链表的最后一个元素next永远都会是null或者undefined
```javascript
    push(element) {
        // 创建节点
        const node = new Node(element)
        let current
        if (this.head === null) {
            this.head = node
        } else {
            current = this.head
            current.next = node
        }
        this.count++
    }
```
## 根据索引找到元素
从0到index - 1 开始遍历，返回第index-1个元素的next引用，也就是第index个节点 
```javascript
    getElementAt(index) {
        // 检验index合法性
        if (index >=0 && index <= this.count) {
            let node = this.head
            for (let i = 0; i < index && node !== null; i++) {
                node = node.next
            }
            return node
        }
        return undefined
    }
```

## removeAt
根据索引删除指定元素
如果删除的元素是表头将head设为undefined，返回undefined
如果删除的元素不是表头，从0到index开始遍历
将当前元素赋值给previous，从head开始 previous = current
将current指向下一个元素 current = current.next
```javascript
    /**
     * 从链表中移除元素
     * @param {*} index 
     * @returns 被删除的节点or undefined
     */
    removeAt(index) {
        // 合法值检验
        if (index >= 0 && index <this.count) {
            let current = this.head
            // 移除表头
            if (index === 0) {
                // 指向undefined
                this.head = current.next
            } else {
                const previous = this.getElementAt(index - 1)
                // 从current缓存第index个节点
                current = previous.next
                // current节点被移除，previous.next 指向current的下一个节点
                previous.next = current.next
            }
            this.count--
            return current.element
        }
        return undefined
    }
```

## insert
根据索引插入元素
```javascript
    /**
     * 
     * @param {*} element 要插入的元素
     * @param {*} index 要插入的位置
     * @returns 
     */
    insert(element, index) {
        // 检验index合法性
        if (index >=0 && index <= this.count) {
            const node = new Node(element)
            if (index === 0) {
                const current = this.head
                node.next = current
            } else {
                const previous = this.getElementAt(index -1)
                const current = previous.next
                node.next = current
                previous.next = node
            }
            this.count++
            return true
        }
        return false
    }
```

## indexOf
返回指定元素的索引值
```javascript 
    /**
     * 
     * @param {*} element 要查找的元素
     * @returns 索引值
     */
    indexOf(element) {
        let current = this.head
        for (let i = 0;i< this.count && current !== null; i++) {
            if (this.equalsFn(element, current.element)) {
                return i
            }
            current = current.next
        }
        return -1
    }
```

## remove
删除指定元素
```javascript
    /**
     * 
     * @param {*} element 被删除的元素
     * @returns 
     */
    remove(element) {
        let index = this.indexOf(element)
        return this.removeAt(index)
    }
```

## other
### size
返回链表的size
```javascript
    size() {
        return this.count
    }
```

### 判空
```javascript
    isEmpty() {
        return this.size() === 0
    }
```

### 获取表头
```javascript
    getHead() {
        return this.head
    }
```
