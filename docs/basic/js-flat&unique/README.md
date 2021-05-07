# 数组扁平和去重

## 数组去重

### 1.使用set数据结构
```javascript
    let array = [1,2,3,3,3,4]
    let unique = new Set(array)
```

### 2. 使用reduce函数和includes判断
``` javascript
function unique(array) {
    return array.reduce((prev, cur) => {
        return prev.includes(cur) ? prev : [...prev, cur]
    }, [])
}
```

### 3. 使用filter函数
```javascript
function unique(array) {
    return array.filter((item, index) => {
        return array.indexOf(item) === index
    })
}
```

### 4.使用hasOwnProperty
```javascript
function unique(array) {
    let obj = {}
    return array.filter((item) => {
        return obj.hasOwnProperty(typeof item + item) ? false : (obj[typeof item + item] = true)
    })
}
```

## 数组扁平flat

### 1.使用reduce方法
```javascript
function flat(array) {
    return array.reduce((prev, cur)=> {
        if (Array.isArray(cur)) {
            return [...prev, ...flat(cur)]
        } else {
            return [...prev, cur]
        }
    }, [])
}
```

### 2.递归
```javascript
    function flat(array) {
    let res = []
    let each = function(array) {
       array.forEach(item => {
           if (Array.isArray(item)) {
               each(item)
           } else {
               res.push(item)
           }
       });
   }
   each(array)
   return res
}
```