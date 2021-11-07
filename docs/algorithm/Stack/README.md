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