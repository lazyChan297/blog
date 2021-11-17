# 二叉树

## 先、中、后序遍历
```javascript
// 先序遍历 根-左-右
let preOrder = (root, arr) => {
    if (!root) return null
    arr.push(root.val)
    preOrder(root.left, arr)
    preOrder(root.right, arr)
    return arr
}
// 中序遍历 左-根-右
let inOrder = (root, arr) => {
    if (!root) return null
    preOrder(root.left, arr)
    arr.push(root.val)
    preOrder(root.right, arr)
    return arr
}

// 后序遍历 左-右-根
let postOrder = (root,arr) => {
    if (root === null) return root
    postOrder(root.left, arr)
    postOrder(root.right, arr)
    arr.push(root.val)
    return arr
}
```
## 按层级遍历二叉树
```javascript
function levelOrder( root ) {
    if (!root) return []
    let res = [], queue = [root]
    while(queue.length) {
        let size = queue.length
        let temp = []
        for (let i = 0; i<size;i++) {
            let current = queue.shift()
            temp.push(current.val)
            current.left && queue.push(current.left)
            current.right && queue.push(current.right)
        }
        result.push(temp)
    }
    return res
}
```

## 按之字形遍历二叉树
```javascript
function Print(root) {
    if (!root) return []
    let reverse = false // false 左-右，true 右到左
    let res = []
    let queue = [root]
    // 按层级遍历二叉树
    while (queue.length) {
        let size = queue.length, list = []
        for (let i = 0; i<size;i++) {
            let cur
            if (!reverse) {
                // 左-右打印，从queue的头部取元素
                cur = queue.shift()
                cur.left && queue.push(cur.left)
                cur.right && queue.push(cur.right)
            } else {
                // 右-左打印，从queue的尾部取元素
                cur = queue.pop()
                cur.right && queue.unshift(cur.right)
                cur.left && queue.unshift(cur.left)
            }
            list.push(cur.val)
        }
        res.push(list)
        // 每遍历一层，reverse去反
        reverse = !reverse
    }
    return res
}
```
## 镜像二叉树
根节点不变，左右子节点树镜像。使用递归逐层替换
```javascript
function Mirror(root) {
    let traversal = (root) => {
        if (!root) return null
        let temp = root.left
        root.left = root.right
        root.right = temp
        traversal(root.left)
        traversal(root.right)
        return root
    }
    return traversal(root)
}
```

## 对称二叉树
判断二叉树的左右子节点树是否为自身的镜像
```javascript
function Mirror(root) {
    if (!root) return null
    let handle = (left, right) => {
        if (!left && !right) return true
        if (!left || !right) return false
        if (left.val !== right.val) return false
        return handle(left.left, right.right) && handle(left.right, right.left)
    }
    return handle(root.left, root.right)
}
```

## 重建二叉树
根据先序遍历和中序遍历的数组，重建二叉树。
1. 根据先序遍历第一个值，判断出根节点
2. 根据根节点在中序遍历的索引值，分割左子节点树和右子节点数，得到中序遍历的左子节点和右子节点数组
3. 根据索引值得到左右子节点树长度，可以求出左子节点的先序遍历结果 pre.slice(1, index+1)，pre.slice(index+1)
4. 根据以上规则递归，便可以重建二叉树
```javascript
function reConstructBinaryTree(pre, vin) {
    if (!pre.length || !vin.length) return null
    let root = pre[0]
    let rootIndex = vin.indexOf(root)
    let vinLeft = vin.slice(0,rootIndex)
    let vinRight = vin.slice(rootIndex+1)
    let preLeft = pre.slice(1,rootIndex+1)
    let preRight = pre.slice(rootIndex+1)
    let node = new ListNode(root)
    node.left = reConstructBinaryTree(preLeft, vinLeft)
    node.right = reConstructBinaryTree(preRight, vinRight)
    return node
}
```

## 重建二叉树后返回右视图
重建的实现和上一题相同，返回右视图需要按层级遍历然后把每一层中最后一个节点的right输出
```javascript
function reBuild(pre, vin) {
    if (!pre.length || !vin.length) return null
    // 重建二叉树
    let root = reConstructBinaryTree(pre,vin)
    let queue = [root]
    let res = []
    while(queue.length) {
        // 每一层用一个新的队列维护
        let size = queue.length, newQueue = []
        for (let i = 0; i < size; i++) {
            let cur = queue[i]
            if (i === size-1) res.push(r.val)
            r.left && newQueue.push(r.left)
            r.right && newQueue.push(r.right)
        }
        // 更新原本队列
        queue = newQueue
    }
    return res
}
```

## 求出二叉树最大深度
```javascript
function maxDepth(root) {
    if (!root) return 0
    let left = maxDepth(root.left)
    let right = maxDepth(root.right)
    return Math.max(left, right) + 1
}
```

## 求出二叉树的最小深度
```javascript
function minDepth(root) {
    if (!root) return 0
    let depth = 1
    let queue = [root]
    while(queue.length) {
        let size = queue.length
        for (let i = 0; i < size; i++) {
            let node = queue.pop()
            if (!node.left && !node.right) return depth
            queue.push(node.left)
            queue.push(node.right)
            depth++
        }
    }
    return depth
}
```

## 二叉树的直径
直径指树上任意两个节点的树上距离的最大值，树上距离指节点深度。
所以只需要找出左右子节点树的最大深度相加，就可以得到二叉树直径
```javascript
function diameterOfBinaryTree(root) {
    if (!root) return 0
    function dfs(root) {
        if (!root) return 0
        let left = dfs(root.left)
        let right = dfs(root.right)
        return Math.max(left, right) + 1
    }
    return dfs(root.left) + dfs(root.right)
}
```

## 二叉树中和为某一值的路径(一)
给定一个二叉树root和一个值 sum ，判断是否有从根节点到叶子节点的节点值之和等于 sum 的路径
```javascript
function hasPathSum(root, sum) {
    if (!root) return false
    // 返回值默认为false
    let res = false
    // 如果当前节点的值等于sum
    if (!root.left && !root.right && root.val === sum) {
        return true
    } else {
        // 遍历当前节点的左右子节点树
        res = res || hasPathSum(root.left, sum-root.val)
        res = res || hasPathSum(root.right, sum-root.val)
    }
    return res 
}
```


## 二叉树中和为某一值的路径(二)
找出二叉树中结点值的和为expectNumber的所有路径
```javascript
let path = [] // 当前符合的路径
let paths = [] //所有符合的路径
function FindPath(root, expectNumber)
{
    // write code here
    if (!root) return []
    if (!root.left && !root.right && root.val === expectNumber) {
        paths.push([...path, root.val])
    } else {
        path.push(root.val)
        FindPath(root.left, expectNumber - root.val)
        FindPath(root.right, expectNumber - root.val)
        path.pop()
    }
    return paths
}
```

## 合并二叉树
合并两颗二叉树，两棵树同样位置都存在节点则相加，否则空的位置由另一颗树对应位置的节点替换
```javascript
function mergeTrees( t1 ,  t2 ) {
    if (!t1) return t2
    if (!t2) return t1
    // 同一位置均存在节点，两个节点值相加
    t1.val += t2.val
    // 递归，左右子节点树相加
    t1.left = mergeTrees(t1.left, t2.left)
    t1.right = mergeTrees(t1.right, t2.right)
    return t1
}
```

## 平衡二叉树
判断该二叉树是否是平衡二叉树，平衡：它是一棵空树或它的左右两个子树的高度差的绝对值不超过1，并且左右两个子树都是一棵平衡二叉树
```javascript
// 求二叉树高度
function DFS(root) {
    let left = DFS(root.left)
    let right = DFS(root.right)
    return Math.max(left, right) + 1
}
// 使用求出二叉树最大深度的方法，分别求出每个节点的左右子树高度进行绝对值比较
function isBalance(root) {
    if (!root) return true
    // 左子节点树的高度
    let leftHeight = DFS(root.left)
    // 右子节点树的高度
    let rightHeight = DFS(root.right)
    // 左右子节点树高度差，如果小于1继续遍历
    let diff = Math.abs(leftHeight - rightHeight)
    if (diff <= 1) {
        return isBalance(root.left) && isBalance(root.right)
    } else {
        return false
    }
}
```

## 求二叉树两个节点的最近公共祖先
```javascript
// 三种情况
// 1. o1、o2分别在公共节点的左右子树
// 2. o1、o2都在同一个子树，公共节点等于o1，即o2是o1的子节点
// 3. o1、o2都在同一个子树，公共节点等于o2，即o1是o2的子节点
function lowestCommonAncestor( root ,  o1 ,  o2 ) {
    // write code here
    // 当前节点为空时返回-1
    if (root === null) return null
    // 当前节点等于o1或o2，o1在o2的子节点树或o2在o1的子节点树
    if (o1 === root.val || o2 === root.val) return root.val
    // 查找在左右子节点树等于o1或o2的节点，如果在左子节点树，那么left不为null
    let left = lowestCommonAncestor(root.left, o1, o2)
    // 如果在右子节点树，那么right不为null
    let right = lowestCommonAncestor(root.right, o1,o2)
    // 公共节点在当前左右子节点树的父节点
    if (left && right) return root.val
    return !left ? right : left 
}
```

## 给定一个升序排序的数组，将其转化为平衡二叉搜索树（BST）
平衡二叉搜索树指树上每个节点 node 都满足左子树中所有节点的的值都小于 node 的值，右子树中所有节点的值都大于 node 的值，并且左右子树的节点数量之差不大于1
使用二分的方式分割数组，构建二叉树
```javascript
function TreeNode(x) {
   this.val = x;
   this.left = null;
   this.right = null;
}
function sortedArrayToBST(num) {
    let mid = Math.floor(num.length/2)
    let root = new TreeNode(num[mid])
    root.left = sortedArrayToBST(num.slice(0,mid))
    root.right = sortedArrayToBST(num.slice(mid+1, num.length))
    return root
}
```

## 找到搜索二叉树中两个错误的节点
一棵二叉树原本是搜索二叉树，但是其中有两个节点调换了位置，使得这棵二叉树不再是搜索二叉树，请按升序输出这两个错误节点的值。(每个节点的值各不相同)
搜索二叉树：满足每个节点的左子节点小于当前节点，右子节点大于当前节点。
将搜索二叉树中序遍历可以得到升序数组，从前往后遍历找到第一个不是升序的元素，从后往前遍历找到第一个不是降序的元素
```javascript
function inOrder(root, arr) {
    inOrder(root.left)
    arr.push(root.val)
    inOrder(root.right)
}
function findError( root ) {
    let res = []
    let arr = []
    inOrder(root, arr)
    // 往后搜索，找到不是升序的
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > arr[i+1]) {
            res.push(arr[i])
        }
    }
    // 往前搜索，找到不是降序的
    for (let i = arr.length-1; i >= 0; i--) {
        if (arr[i] < arr[i-1])
            res.push(arr[i])
    }
     
    return [Math.min(...res), Math.max(...res)]
}
```
## NC60 判断一棵二叉树是否为搜索二叉树和完全二叉树
ps：完全二叉树指不是叶子节点的节点同时有左右子节点，遇到不是叶子节点的节点且左右子节点不双全就不是完全二叉树
```javascript
function judgeIt(root) {
    return [bst(root, -Infinity, Infinity), fullTree(root)]
}
// 是否搜索二叉树
function bst(root, min, max) {
    if (!root) return true
    if (root.val <= min || root.val >= max) return false
    return bst(root.left, min, root.val) && bst(root.right, root.val, max)
}
// 是否完全二叉树
function fullTree(root) {
    if (!root) return true
    let queue = [root]
    // 没有左子节点或没有右子节点，flag=false
    let flag = true
    while(queue.length) {
        let len = queue.length
        for (let i = 0; i < len; i++) {
            let node = queue.shift()
            if (node.left) {
                if (!flag) return false
                queue.push(node.left)
            } else {
                flag = false 
            }
            if (node.right) {
                if (!flag) return false
                queue.push(node.right)
            } else {
                flag = false
            }
        }
    }
    return true
}
```