# 栈

## 实现最小栈
```javascript
var MinStack = function() {
    this.stack = []
    this.min_stack = [Infinity] // 初始化时存放一个正无穷大的数
};

MinStack.prototype.push = function(val) {
    this.stack.push(val)
    this.min_stack.push(Math.min(this.min_stack[this.min_stack.length - 1], val))
};

/**
 * @return {void}
 */
MinStack.prototype.pop = function() {
    this.stack.pop()
    this.min_stack.pop()
};

/**
 * @return {number}
 */
MinStack.prototype.top = function() {
    return this.stack[this.stack.length - 1]
};

/**
 * @return {number}
 */
MinStack.prototype.getMin = function() {
    return this.min_stack[this.min_stack.length - 1]
};

```

## 有效的括号序列
```javascript
function isValid(s) {
    let map = {
        '{':'}',
        '[':']',
        '(':')'
    }
    let stack = []
    for (let i = 0; i < s; i++) {
        if (map.has[i]) {
            stack.push(i)
        } else {
            let top = stack.pop()
            if (!top) return false
            if (map[top] !== s[i]) return false
        }
    }
    return stack.length === 0
}

```

## 栈和排序
```javascript
function solve( a ) {
    let stack = []
    // 保存出栈顺序结果
    let res = []
    // 标记元素是否出现过
    let vis = new Array(a.length).fill(0)
    // 出栈元素最大值
    let n = a.length
    for(let i = 0; i < a.length; ++i) {
        // 压入
        stack.push(a[i])
        // 标记
        vis[a[i]] = 1
        // 判断压入栈的元素中有没有大于等于栈顶元素
        while(n>0&&vis[n] === 1) n--
        // 让大于n的元素出栈
        while(stack.length && stack[stack.length-1] >= n) {
            res.push(stack[stack.length-1])
            stack.pop()
        }
    }
    // 遍历结束如果还有元素没有出栈，保存原本顺序出栈
    while(stack.length) {
        res.push(stack[stack.length-1])
        stack.pop()
    }
    return res
}
```