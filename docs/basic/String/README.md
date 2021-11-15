# String

- `JSON.stringify(转换成json字符串的指定参数, 函数或数组(转换过程中执行的函数或属性值是数组中的某一个), 数字或字符串(数字代表空格数，字符串代表在前面拼接该字符串))`

实现`JSON.stringify`函数，后面的两个参数可忽略
```javascript
function stringify(data) {
    // js中最大的整数 2的53次方-1
    if(typeof data === 'bigint') {
        throw new Error('Do not know how to serialize a BigInt at JSON.stringify');
    }
    // 字符串需要在外面加""
    if(typeof data === 'string') {
        return `"${data}"`;
    }
    // 函数返回undefined
    if(typeof data === 'function') {
        return undefined;
    }
    // 循环引用会被忽略
    if(data !== data) {
        return 'null';
    }
    // 正无穷大或负无穷大
    if(data === Infinity || data === -Infinity) {
        return 'null';
    }
    // 数字或布尔值返回它们的字符串类型
    if(typeof data === 'number' || typeof data === 'boolean') {
        return `${data}`;
    }
    // null、undefined、symbol会被忽略
    if(data === null || data === undefined || typeof data === 'symbol') {
        return 'null';
    }
    // 时间类型会返回YYYY-MM-DDTHH:mm:ss.sssZ
    if (data instanceof Date) return `"${data.toISOString()}"`
    // 数组
    if (Array.isArray(data)) {
        let arr = data.map(item => stringify(item))
        return `[${arr.join(',')}]`;
    }
    // 对象
    if (typeof data === 'object') {
        // 返回对象自身的属性，不能用for.in，因为for.in会返回原型链上的属性
        const arr = Object.entries(data).reduce((acc, [key, value]) => {
            if(value === undefined) {
                return acc;
            }
            acc.push(`"${key}":${stringify(value)}`);
            return acc;
        }, [])
        return `{${arr.join(',')}}`;
    }
}
```

- `JSON.parse(要解析的目标字符串, 解析过程中执行的函数)`

```JavaScript
function parse(str) {
    // 空字符串&单引号开头解析会报错
    if(str === ''||str[0] === "'") throw Error();
    if(str === 'null') return null
    if(str === '{}') return {}
    if(str === '[]') return []
    if(str === 'true') return true
    if(str === 'false') return false
    // 去掉前后的双引号
    if(str[0] === '"') return str.slice(1, -1)
    // 返回数字本身
    if(+str === +str) return Number(str)
    // 对象
    if(str[0] === '{') {
        return str.slice(1, -1).split(',').reduce((acc, item) => {
        const index = item.indexOf(':')
        const key = item.slice(0, index)
        const value = item.slice(index + 1)
        acc[parse(key)] = parse(value)
        return acc
        }, {})
    }
    // 数组
    if(str[0] === '[') {
        return str.slice(1, -1).split(',').map((value) => parse(value));
    }
}
```

- `String.prototype.slice(i,j)` 如果j是负数那么j等于字符串长度+j