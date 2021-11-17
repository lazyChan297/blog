# KMP
给你一个文本串 T ，一个非空模板串 S ，问 S 在 T 中出现了多少次
S:`ababab`, T:`abababab`

根据模版字符串求出next数组，next数组的值与模版字符串的值的最长公共前缀索引位置对应，
例如ababab的next数组是`[-1,0,0,1,2,3]`，a对应`-1，因为没有最长公共前缀<br/>
当模版串与字符串不匹配时，回溯到上一个最长公共前缀的位置尝试匹配，匹配失败则再回溯，直到next的值变为-1，再变化文本串的指针

```javascript
function kmp(s, t) {
    if (!s || !t) return 0
    let res = 0, i = 0, j = 0
    let next = getNext(s)
    while(i < t.length && j < s.length) {
        if (t[i] === s[j]) {
            i++
            j++
            if (j === s.length) {
                res++
                i--
                j = next[j-1]
            }
        } else if (next[j] === -1) {
            i++
        } else {
            j = next[j]
        }
    }
    return res
}
function getNext(s) {
    let next = new Array(s.length).fill(0)
    next[0] = -1
    let i = 2, j = 0
    while(i < s.length) {
        if (s[j] === s[i-1]) {
            next[i++] = ++j
        } else if (j > 0) {
            j = next[j]
        } else {
            next[i++] = 0
        }
    }
    return next
}
```
