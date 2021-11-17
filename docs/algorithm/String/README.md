# String

## 最长公共前缀
```javascript
function longestCommonPrefix( strs ) {
    if (!strs.length) return ''
    if (strs.length === 1) return strs[0]
    // 返回值默认为空
    let res = ''
    strs.sort()
    // 对字符串数组排序，排列的结果按照字典序排列，所以只需要用第一个和最后一个比较
    let first = strs[0], last = strs[strs.length-1]
    for (let i = 0; i < first.length; i++) {
        if (first[i] === last[i]) {
            res += first[i]
        } else {
            break
        }
    }
    return res
}
```

## 最长公共子串长度
给定两个字符串str1和str2,输出两个字符串的最长公共子串
```javascript
function LCS(str1 ,  str2) {
    // 以较短的字符串遍历
    if (str1.length > str2.length) {
        [str1, str2] = [str2, str1]
    }
    // 最大子串长度，默认值是0
    let maxLen = 0, res = ''
    for (let i = 0; i < str1.length; i++) {
        let char = str1.slice(i-maxLen, i+1)
        if (str2.indexOf(char) !== -1) {
            res = char
            maxLen++
        }
    }
    return maxLen
}
```

## 判断回文
找到字符串中间索引为中心，定义左右两枚指针，向两边扩散。字符串长度为奇数时，左右指针都是中间值索引；偶数时左指针为中间值-1，右指针为中间值
```javascript
function judge( str ) {
    // write code here
    if (!str.length) return true
    let len = str.length
    let isOdd = len % 2 === 0 ? false : true
    let mid = Math.floor(len/2)
    let left = isOdd ? mid : mid - 1
    let right = isOdd ? mid : mid
    while(left >= 0 && right < len) {
        if (str.charAt(left) === str.charAt(right)) {
            left--
            right++
        } else {
            return false
        }
    }
    return true
}
```
## 最长回文子串
对于一个字符串（仅包含小写英文字母），请设计一个高效算法，计算其中最长回文子串的长度。
```javascript
function getLongestPalindrome(string, n) {
    if (n < 2) return 0
    // 返回最大子串长度，默认值是0
    let maxLen = 0
    for (let i = 0; i < n; i++) {
        let len = palindrome(i,i+1,string,n) > palindrome(i,i,string,n) ? palindrome(i,i+1,string,n):palindrome(i,i,string,n)
        maxLen = Math.max(maxLen, len)
    }
    return maxLen
}
// 返回回文子符串的长度
function palindrome(left, right, string, n) {
    while(left >= 0 && right < n) {
        if (string.charAt(left) === string.charAt(right)) {
            left++
            right--
            continue
        }
        break
    }
    // +1 索引值是比长度小1
    // -2 只有当left<0,right>n才会退出循环  
    // left = -1，负负得正 (--1) => +1
    // right = n+1 
    return right - left + 1 - 2
}
```

## 旋转字符串
给定两字符串A和B，如果能将A从中间某个位置分割为左右两部分字符串（可以为空串），并将左边的字符串移动到右边字符串后面组成新的字符串可以变为字符串B时返回true
输入：`"youzan","zanyou"`，输出`true`，`"youzan","zyouan"`，输出`false`
```javascript
function solve( A ,  B ) {
    for (let i = 0; i < A.length; i++) {
        let s1 = A.substring(0, i)
        let s2 = A.substring(i, A.length)
        if (s2 + s1 === B) return true
    }
    return false
}
```

## 字符串出现次数的TopK问题
给定一个字符串数组，再给定整数 k ，请返回出现次数前k名的字符串和对应的次数
1. 对字符串数组按照字典序排序
2. 遍历字符串数组
3. 每次遍历创建1枚j指针，j指针的值为i+1，使第i个字符串与第i+1个字符串比较是否相同
4. 满足3相同条件下，j++
5. 把j指针和第i个字符串的值保存到一个二维数组中
6. 下一次循环为第j个字符串开始，i=j
```javascript
function topKstrings(strings, k) {
    // 对字符串数组按照字典序排序
    strings.sort()
    let res = []
    for(let i = 0; i <strings.length) {
        let j = i + 1
        while(strings[i] === strings[j] && j < strings.length) {
            j++
        }
        res.push([strings[i], (j-i).toString()])
        // 下一次循环为第j个字符串开始，i=j
        i = j
    }
    // 按出现次数降序排序
    res.sort((a,b) => b[1]-a[1])
    return res.slice(0, k)
}
```

## 字符串转换为整数
1. 去掉无用的前导空格
2. 第一个非空字符为+或者-号时，作为该整数的正负号，如果没有符号，默认为正数
3. 判断整数的有效部分：
    - 确定符号位之后，与之后面尽可能多的连续数字组合起来成为有效整数数字，如果没有有效的整数部分，那么直接返回0
    - 将字符串前面的整数部分取出，后面可能会存在存在多余的字符(字母，符号，空格等)，这些字符可以被忽略，它们对于函数不应该造成影响
    - 整数超过 32 位有符号整数范围 [−231,  231 − 1] ，需要截断这个整数，使其保持在这个范围内。具体来说，小于 −231的整数应该被调整为 −231 ，大于 231 − 1 的整数应该被调整为 231 − 1
4. 去掉无用的后导空格
```javascript
function StrToInt( s ) {
    if (!s) return 0
    // 使用正则表达式匹配+-数字开头部分
    let strArr = s.trim().match(/^[+-]?\d+/)
    if (!strArr) return 0
    if (strArr[0] >= Math.pow(2,31)) return Math.pow(2, 31) -1
    if (strArr[0] <= Math.pow(-2,31)) return Math.pow(-2, 31)
    return strArr[0]
}
```

## 第一个只出现一次的字符
```javascript
function FirstNotRepeatingChar(str)
{
    // write code here
    let res = -1, map = new Map(),strArr = str.split('')
    for(let i = 0; i < strArr.length;i++) {
        if (!map.has(strArr[i]) && i === strArr.lastIndexOf(strArr[i])) {
            res = i
            break
        } else {
            map.set(strArr[i], true)
        }
    }
    return res
}
```

## 无重复字符的最长子串
注意：子串是必须连续的，子序列不是。<br/>
使用滑动窗口的方式来解决，定义`i`指针为窗口左边界，初始值为`0`，`right`为窗口右边界，初始值为`-1`；使用`set`来保存无重复的子串；<br/>
如果遇到不是重复的字符，右指针向右移动，直到遇到重复字符，记录本次重复子串长度=`右指针-左指针+1`，与上一个重复子串的长度比较取最大值；
开启下一轮遍历，左指针向右移动，同时减去滑动窗口最左边的字符来比较
```javascript
var lengthOfLongestSubstring = function(s) {
    let set = new Set()
    let res = 0
    let right = -1
    let n = s.length
    for (let i = 0; i < n; ++i) {
        // 不是第0次遍历剔除滑动窗口最左边的值
        if (i != 0) {
            set.delete(s.charAt(i-1))
        }
        // 遇到无重复字符且右边在合法范围内
        while(right + 1 < n && !set.has(s.charAt(right+1))) {
            set.add(s.charAt(right+1))
            ++right
        }
        res = Math.max(res, right - i + 1)
    }
    return res
}
```

## 字符串的排列
输入`ab`，输出`[ab,ba]`
```JavaScript
function Permutation(str) {
    // 使用set保存排列后的结果
    let set = new Set()
    // 创建一个递归函数
    let recursive = (prev, str) => {
        // 当字符串已经拆分结束，将排列的结果保存
        if (str.length === 0) set.add(prev)
        for (let i = 0; i < str.length; ++i) {
            // 将当前字符固定在前，当前字符前面的字符和后面的字符递归判断
            recursive(prev+str[i], str.slice(0,i).concat(str.slice(i+1)))
        }
    }
    recursive('', str)
    return Array.from(set)
}
```