# RegExp

- 断言
    - `^`匹配输入的开头，例如`var reg = /^A/`，`var string = 'An A'`，只会匹配第一个开头的A
    - `$`匹配输入的结尾，例如`var reg = /t$/`，`var string = let`，会匹配以t结束的字符
    - `/b` 匹配单词的边界，例如 `/n\b/`，匹配了`pattern`中单词的边界n
    - `/B` 匹配非单词边界，例如 `/wo\B/`，匹配了 `hello world`中非单词的边界wo
    - `x(?=y)` 向前断言，匹配被y紧随的x，例如`/hello(?=World)/`，匹配了`helloWorld`里的hello
    - `x(?!y)` 向前否定断言，匹配没有被 y 紧随的 x，`/\d+(?!\.)/` 匹配`123.456`中的12
    - `(?<=y)x` 向后断言，x跟随y的情况下匹配x
    - `(?<!y)x` x不跟随y时，匹配x
- 字符类
    - `\d` 匹配数字
    - `\D` 匹配非数字
    - `\w` 匹配所有阿拉伯数字和字母、下划线，等于`/[A-Za-z0-9_]`
    - `/W` 匹配非字母，数字，下划线外的
- 组和范围
    - `x|y` 匹配x或y中的一项
    - `[a-z]` 匹配区间，匹配a-z中的字母
    - `^[a-c]` 匹配a，b，c区间开头
    - `(x)` 捕获组，记住当前匹配的结果与后面的规则继续匹配
- 量词（匹配的数量）
    - `*` 将前面的匹配结果与后面的匹配0次或多次
    - `?` 将前面的捕获组匹配**0**次或**1**次，如果是`*?`或者`+?`都变为非贪婪匹配，只要有一次匹配结果，就不会往下继续查询
    - `+` 将前面的匹配1次或多次 例如 `/(\d)(?=(\d${3})+$/g` 就是把数字后面也跟随三个数字的结果匹配多次
    - `x{n}` n是正整数，将前面的结果匹配n次
    - `x{n,m}` m、n都是正整数，至少匹配n次，至多匹配m次

## 常用

### 千分位分隔符<br/>
实现一个正则表达式判断，如果一个数字后面连续匹配3个数字，那么就给该数字添加一个千分位分隔符，
如果小数部分也需要，那么实现一个正则表达式判断，如果匹配三个数字数字后面紧随着数字，那么在该三个数字后面添加千分位分隔符
```JavaScript
function addComma(num) {
    // 将整数部分和小数部分解构
    let [integer, fraction] = num.toString().split('.')
    // 整数部分匹配规则，(\d)匹配数字，(?=(\d{3})+$)匹配三个数字 +号实现多次匹配
    let integerRegExp = /(\d)(?=(\d{3})+$)/g
    // 小数部分匹配规则，和整数部分相反，每3个数字后面紧随着一个数字，+号实现多次匹配
    let fractionRegExp = /(d{3})(?=(\d)+$)/g
    // 为整数部分添加分隔符，$n表示正则表达式中的第n个捕获组，$1表示第一个括号里的捕获组
    integer = integer.replace(integerRegExp, '$1,')
    fraction && (fraction = fraction.replace(fractionRegExp, '$1'))
    return integer + (fraction?'.'+fraction:'')
}
```
可以通过这个链接验证[添加千分位符](https://bigfrontend.dev/zh/problem/add-comma-to-number)
### 模版解析
以解析`{name}`里面的字符为例，假设有一个模板`my name is {name}`，根据这个模版调用模版解析函数，将花括号的值修改成你传入的值
```javascript
    function convert(string, data) {
    // 使用非贪婪匹配
    let reg = /\{(.*?)\}/g
    return string.replace(reg, (a,b) => {
      return data[b]
    })
  }
  convert('my name is {name}', {name: 'louis'}) // my name is louis
```

### 大小写取反
例如`aBc` -> `AbC`
```javascript
function convert(string) {
    return string.replace(/[a-zA-Z]/g, a => {
        return /[a-z]/.test(a) ? a.toUpperCase() : a.toLowerCase()
    })
}
```

### 高亮字符串
给定一个html字符串和数组，对字符串中与数组元素匹配的字符添加高亮标签，为了让正则表达式动态匹配字符，<br/>
所以用`new RegExp(keywords.join('|'), ig)`动态传入，`i`忽略大小写，`g`全局匹配。<br/>
但是有一个特殊情况，匹配数组中可能会有`[frontend, front, end]`，<br/>
而字符串中也可能存在是数组中两个元素拼接的字符例如`frontend`<br/>
首先让数组中的元素按照length从大到小排列，优先匹配长度大的，<br/>
接着为了防止完整的字符被数组中两个元素分割，例如`frontend`分别被`front`和`end`匹配，就会出现被拆分高亮的情况，所以全部匹配完后要检测有没有完整的`</em><em>`
```javascript
function hightLight(html,keywords) {
    // 首先将匹配关键字降序排序
    keywords.sort((a,b) => b.length - a.length)
    const reg = new RegExp(keywords.join('|'))
    let newHtmlArray = html.split(' ').map(item => {
        return item.replace(reg, `<em>$1</em>`)
    })
    return newHtmlArray.join(' ').replace('</em><em>', '')
}
```

### 驼峰命名转换
将键名`ass_baa_cee`转换为`AssBaaCee`，如果键值依然是引用类型，那么继续递归把引用类型的key也实现转换
```javascript
function convert(jsonObj) {
    let transformKeyName = (string) => {
        return string.replace(/_([a-zA-z])$/g, (all, b) => {
            return b.toUppercase()
        })
    }
    let handle = (obj) => {
        if (typeof obj !== 'object') return false
        Object.keys(obj).forEach(key => {
            // 缓存原来的value
            let value = obj[key]
            let newKey = transformKeyName(key)
            obj[newKey] = value
            delete obj[key]
            if (Object.prototype.toString.call(value) === '[object Object]') {
                transformKeyName(value)
            } else if(Array.isArray(value)) {
                for(let i =0; i <value.length;i++) {
                    transformKeyName(value[i])
                }
            }
        })
        return obj
    }
    return handle(jsonObj)
}
```

### 检测ip地址合法性
- ipv4
    1. 分成四段`.`分割
    2. 第一个不能以`0n`开头但是可以是单独的`0`，所以需要限制个位数是0-9，两位数是第一个数字不能是0
    3. 数字最大不能超过`255`
    4. 每段不能超过3个数字<br/>
对前三段限制`/^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}$/g`
对第四段限制`/([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/g`
- ipv6
    1. 分成八段`:`分割
    2. 可以包含a-f的大小写字母
    3. 每段不能超过4个字符长度<br/>
对前七段限制 `/^([0-9A-Fa-f]${1,4}:)${7}$/g`
对第八段限制 `/([0-9A-Fa-f]${1,4})$/g`
```javascript
function isValidIp(str) {
    let ipv4Reg = /^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/g
    let ipv6Reg = /^([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4})$/g
    return ipv4Reg.test(str) || ipv6Reg.test(str)
}
```

### 找出连续出现最多的字符和个数, 以对象形式返回
- `'aaaccccccvxxxx' => {c:6}`
`'aabbcc' => {a:2,b:2,c:2}`
```JavaScript
function findCharMax(string) {
    // 1*表示与前面的小括号的匹配项内容相同
    let reg = /(\w)\1*/g
    // 返回一个以相同字符串为1个元素的数组
    let charArr = string.match(reg)
    // 找到出现最多的字符
    let max = Math.max(...charArr.map(s => s.length))
    return charArr.reduce((prev, cur, index) => {
        if (cur.length === max) {
            return {...prev, [cur.substring(0,1)]: max}
        }
        return prev
    }, {})
}
```

### 压缩字符串
- `'a' -> 'a'` `'aa' -> 'a2'` `'aaa' - 'a3'`
- `'aaab' -> 'a3b'`
- `'aaabba' -> 'a3b2a'`
```JavaScript
function findCharMax(string) {
    // 1*表示与前面的小括号的匹配项内容相同
    let reg = /(\w)\1*/g
    // 返回一个以相同字符串为1个元素的数组
    let charArr = string.match(reg)
    return charArr.reduce((prev, cur, index) => {
        if (cur.length === 1) {
            return prev += cur.substring(0, 1)
        } else {
            return prev += cur.substring(0, 1) + cur.length
        }
    }, '')
}
```