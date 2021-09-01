# 二叉树

## 定义
只有一个根结点，每个节点最多两个子节点，左子节点必然小于它的父节点，右子节点必然大于它的父子节点

## 实现

### 构造函数
```javascript
    const Compare = {
        LESS_THEN: 'LESS_THEN',
        BIGGER_THEN: 'BIGGER_THEN'
    }
    function compareFn(a,b) {
        if (a>b) {
            return 'BIGGER_THEN'
        } else {
            return 'LESS_THEN'
        }
    }
    class BinaryTree {
        constructor() {
            this.compareFn = compareFn
            this.root = null
        }
    }
```

### 插入节点
如果插入节点小于当前节点，判断当前节点是否有左侧节点，如果没有，将节点插入左侧
如果有左侧节点递归insertNode方法继续查找树的下一层，继续与下一层的左侧节点比较
如果插入节点大于当前节点，判断当前节点是否有右侧节点，如果没有，将节点插入右侧
如果有右侧节点递归insertNode方法继续查找树的下一层，则继续与下一层的右侧节点比较
```javascript
    insert(key) {
        // 判断根节点是否非空
        if (this.root === null) {
            // 插入根结点
            this.root = new Node(key)
        } else {
            // 插入普通节点
            this.insertNode(this.root, key)
        }
    }
    /**
     * @param {*} node 
     * @param {*} key 
     */
    insertNode(node, key) {
        if(this.compareFn(key, node.key) === Compare.LESS_THEN) {
            if (node.left === null) {
                node.left = new Node(key)
            } else {
                this.insertNode(node.left, key)
            }
        } else {
            if (node.right === null) {
                node.right = new Node(key)
            } else {
                this.insertNode(node.right, key)
            }
        }
    }
```

### 根据key搜索节点
```javascript
    search(key) {
        return this.searchNode(this.root, key)
    }
    searchNode(node, key) {
        if (node === null) return false
        if (this.compareFn(key, node.key) === Compare.LESS_THEN) {
            return this.searchNode(node.left, key)
        } else if (this.compareFn(key, node.key) === Compare.BIGGER_THEN) {
            return this.searchNode(node.right, key)
        } else {
            return true
        }
    }
```

### 遍历
#### 先序遍历
从上到下，从左到右
```javascript
    preOrderTraverse(callback) {
        return this.preOrderTraverse(this.root, callback)
    }
    preOrderTraverseNode(node, callback) {
        if (node !== null) {
            callback(node)
            this.preOrderTraverseNode(node.left, callback)
            this.preOrderTraverseNode(node.right, callback)
        }
    }
```
#### 后序遍历
从左到右，从下到上
```javascript
    postOrderTraverse(callback) {
        return this.postOrderTraverseNode(this.root, callback)
    }
    postOrderTraverseNode(node, callback) {
        if (node !== null) {
            this.postOrderTraverseNode(node.left, callback)
            this.postOrderTraverseNode(node.right, callback)
            callback(node.key)
        }
    }

```

#### 中序遍历
从最左的子节点 -> 左子节点的父节点 -> 左子节点的父节点右节点
```javascript
    inOrderTraverse(callback) {
        this.inOrderTraverseNode(this.root, callback)
    }
    inOrderTraverseNode(node, callback) {
        if (node !== null) {
            this.inOrderTraverseNode(node.left, callback)
            callback(node.key)
            this.inOrderTraverseNode(node.right, callback)
        }
    }
```

#### 找最值
```javascript
    // 最小值
    min(){
        return this.minNode(this.root)
    }
    minNode() {
        let current = node
        while(current !== null && current.left !== null) {
            current = current.left
        }
        return current
    }
    // 查找树的最大值
    max(){
        return this.maxNode(this.root)
    }
    maxNode() {
        let current = node
        while( current !== null && current.right !== null) {
            current = node.right
        }
        return current
    }
```

### 根据key移除节点
递归遍历二叉树，如果被删除的节点小于当前节点，node.left = removeNode(node.left, key) return node 往下执行当前节点的左叶节点
如果被删除节点大于被删除的节点，递归当前节点的右叶节点 node.right = removeNode(node.right, key) return node 往下执行当前节点的右叶节点
如果当前节点等于被删除节点进入判断 
    a. 被删除节点无左右叶节点 直接将节点设为null
    b. 如果被删除节点有一个左叶节点or右叶节点，删除该节点并把该删除节点的父节点的left指向该删除节点的子节点
    c. 如果被删除节点左右叶节点都有，
```javascript
    remove(key) {
        return this.removeNode(this.root, key)
    }
    removeNode(node, key) {
        // 节点不存在
        if (node === null) return
        // 被删除节点小于当前节点
        if (this.compareFn(key, node.key) === Compare.LESS_THEN) {
            node.left = this.removeNode(node.left, key)
            return node 
        } else if(this.compareFn(key, node.key) === Compare.BIGGER_THEN) {
            node.right = this.removeNode(node.right, key)
            return node
        } else {
            // 递归到当前节点且当前节点没有左右子节点，直接将当前节点设为空置，返回节点
            if (node.left == null && node.right == null) {
                node = null
                return node
            }

            if (node.left == null) {
                node = node.right
                return node
            } else if(node.right == null) {
                node = node.left
                return node
            }
            // 被删除的节点均有左右叶节点，找出被删除的节点右叶节点中最小的值替换被删除节点
            const aux = this.minNode(node.right)
            // 作为替换的节点要被删除，所以重新执行上面的逻辑，但是根结点是被删除节点的右叶节点
            node.key = aux.key
            node.right = this.removeNode(node.right, aux.key)
            return node
        }
    }
```