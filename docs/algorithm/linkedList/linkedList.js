class LinkedList {
    constructor() {
        this.count = 0; // 链表的长度
        this.head = undefined // 表头，类似于二叉树的head
        this.equalsFn = equals
    }
    // c
    push(element) {
        const node = new Node(element)
        let current
        if (this.head === undefined) {
            this.head = node
        } else {
            current = this.head
            while(current.next !== undefined) {
                current = current.next
            }
            current.next = node
        }
        this.count++
    }
    // 
    /**
     * 从链表中移除元素
     * @param {*} index 
     * @returns 
     * 如果删除的元素是表头将head设为undefined，返回undefined
     * 如果删除的元素不是表头，从0到index开始遍历
     * 将当前元素赋值给previous，从head开始 previous = current
     * 将current指向下一个元素 current = current.next
     */
    removeAt(index) {
        // 移除表头
        if (index >= 0 && index < this.count) {
            let current = this.head
            if (index === 0) {
                this.head = current.next
            } else {
                const previous = this.getElementAt(index - 1)
                current = previous.next
                previous.next = current.next
            }
            this.count--
            return current.element
        }
        return undefined
    }
    // 找出目标元素索引值
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
    // 从任意位置插入元素
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
    // 返回一个元素位置
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
    // remove
    /**
     * 
     * @param {*} element 被删除的元素
     * @returns 
     */
    remove(element) {
        let index = this.indexOf(element)
        return this.removeAt(index)
    }
    size() {
        return this.count
    }
    isEmpty() {
        return this.size() === 0
    }
    getHead() {
        return this.head
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



