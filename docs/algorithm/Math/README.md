# Math

## 大数加法
给定两个字符串格式的数字，求出它们相加的结果以字符串格式返回
```javascript
function solve(s, t) {
    let i = s.length-1
    let j = t.length-1
    let res = []
    // 保存进位
    let prev = 0
    while(i>=0 || j>=0 || prev!==0) {
        let m = s[i] >= 0 ? +s[i] : 0
        let n = t[j] >= 0 ? +t[j] : 0
        let sum = m+n+prev
        prev = Math.floor(sum/10)
        let digist = sum%10
        res.push(digist)
        i--
        j--
    }
    return res.reverse().join('')
}
```

## 大数乘法
给定两个字符串格式的数字，求出它们相乘的结果以字符串格式返回
```javascript
function solve(s,t) {
    let len1 = s.length
    let len2 = t.length
    let num1 = s.split('')
    let num2 = t.split('')
    // 返回计算结果的数组
    let arr = new Array(len1+len2-1).fill(0)
    for (let i = 0; i<len1;i++) {
        for (let j = 0; j < len2; j++) {
            arr[i+j] += num1[i] * num2[j]
        }
    }
    for (let k = arr.length-1;k>0;k--) {
        arr[k-1] += Math.floor(arr[k]/10)
        arr[k] = arr[k]%10
    }
    return arr.join('')
}
```

## 两数之和
```javascript
function twoSum( numbers ,  target ) {
    let i = 0, j = 1
    while(numbers[i]+numbers[j] !== target) {
        if (j === numbers.length-1) {
            i++
            j = i
        }
        j++
    }
    return [i,j]
}
```

## 数组中相加和为0的三元组
例如，给定的数组 S = {-10 0 10 20 -10 -40},解集为(-10, -10, 20),(-10, 0, 10) 

```javascript
function threeSum( num ) {
    if (num.length < 3) return []
    num.sort((a,b) => a-b)
    let res = [], i = 0, len = num.length
    while(num[i] <= 0) {
        // i和下一个值相同则跳过本次循环，避免重复求值
        if (i > 0 && num[i] === num[i+i]) {
            i++
            continue
        }
        let left = i+1
        let right = len-1
        while(left < right) {
            if (num[i] + num[left] + num[right] === 0) {
                res.push([num[i],num[left],num[right]])
                // 如果L和下一个指向的值相同，继续右移
                while(num[left] === num[left+1]) {
                    left++
                }
                // 如果r和下一个指向的值相同，继续左移
                while(num[right] === num[right-1]) {
                    right--
                }
                left++
                right--
            } else if (num[i] + num[left] + num[right] < 0) {
                // 求和小于0，left右移
                left++
            } else {
                // 求和结果大于0，right左移
                right--
            }
        }
        if (left >= right) {
            i++
        }
    }
    return res
}
```

## 求平方根
计算并返回x的平方根
```javascript
function sqrt( x ) {
    let i = 0, j = x, res = -1
    while (i <= j) {
        let mid = i + Math.floor((j-i)/2)
        if (mid * mid <= x) {
            res = mid
            j = mid+1
        } else {
            j = mid-1
        }
    }
    return res
}
```

## 进制转换
给定一个十进制数 M ，以及需要转换的进制数 N 。将十进制数 M 转化为 N 进制数。
```javascript
function solve( M ,  N ) {
    // write code here
    // 使用Number.toString(需要转换的进制数)可以直接转换
    // 如果N大于10，需要把字母替换为大写
    const str = M.toString(N)
    let result = ''
    for (let char of str) {
        if (/[a-z]/.test(char)) {
            char = char.toUpperCase()
        }
        result += char
    }
    return result
}
```

## 整数反转
`716` -> `617`
```JavaScript
function solve(num) {
    // 反转后的结果
    let res = 0
    while(num !== 0) {
        let digits = num % 10
        num = ~~(num/10)
        res = res * 10 + digits
        if (res >= Math.pow(2,31) || res <= Math.pow(-2,31)) return 0
    }
    return res
}
```

## 判断是否回文数字
```JavaScript
function isPalindrome( x ) {
    if (x % 10 === 0 && x > 0 || x < 0) return false
    // 旋转后的数字
    let res = 0
    while (x > res) {
        res = res * 10 + x%10
        x = Math.floor(x/10)
    }
    // 处理回文数字是aba结构时的判断
    return x === res || x === Math.floor(res/10)
}
```

## 二进制中1的个数
给出一个十进制数`10`，转换为二进制数后是`1010`，那么1的个数就为2
使用按位或操作符`&`，`n & (n-1)`可以从右到左剔除掉`1`的，剔除的次数就是`1`的个数
```JavaScript
function NumberOf1(n) {
    // 1出现的个数
    let res = 0
    while(n) {
        res++
        n = n & (n-1)
    }
    return res
}
```

## 3个数的最大乘积
```javascript
function solve( A ) {
    let len = A.length-1
    A.sort((a,b) => a-b)
    let m1 = A[0] * A[1] * A[len]
    let m2 = A[len-1] * A[len-2] * A[len]
    return Math.max(m1,m2)
}
```
