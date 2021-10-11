# Array

## 稀疏数组
正常情况下，数组的长度从0开始，自动递增维护，如果元素的索引值如果不是连续的，就是**稀疏数组**。
通过`length`修改数组长度时，如果length是小于数组长度，那么会剔除掉修改后的length后面索引的元素，
如果length大于数组长度，那么获取超出数组length - 1 外的索引的元素是`undefined`

## ES6+新增
`forEach` 接受一个回调函数和一个调用回调函数时this的值作为参数，回调函数接收`当前元素，当前索引，当前数组`三个参数，
该方法无返回值；如果是稀疏数组不会对不存在的元素执行回调函数

`map` 接受一个回调函数和一个调用回调函数时this的值作为参数，回调函数接收`当前元素，当前索引，当前数组`三个参数，
该方法返回值是每一次遍历回调函数返回值组成的新数组，如果返回的新数组有元素是引用类型，那么等同于slice的浅拷贝；
且执行回调函数时，**如果对当前的元素修改，也会映射到原数组对应的元素上**
如果是稀疏数组不会对不存在的元素执行回调函数

`filter` 接受一个回调函数和一个调用回调函数时this的值作为参数，回调函数接收`当前元素，当前索引，当前数组`三个参数，
该方法返回值是返回满足判断条件的元素到新数组，对原数组不会影响
如果是稀疏数组不会对不存在的元素执行回调函数

`every` 接受一个回调函数和一个调用回调函数时this的值作为参数，回调函数接收`当前元素，当前索引，当前数组`三个参数，
该方法返回值是一个布尔值，如果**每一个元素都满足条件判断才会返回true**
如果是稀疏数组不会对不存在的元素执行回调函数

`some`  接受一个回调函数和一个调用回调函数时this的值作为参数，回调函数接收`当前元素，当前索引，当前数组`三个参数，
该方法返回值是一个布尔值，如果**有一个元素都满足条件判断就会返回true**

`reduce` 接受一个回调函数和一个初始值作为参数，回调函数接收`累计值，当前元素，当前索引，当前数组`三个参数，
**如果设置了初始值，那么遍历时会从0开始执行回调函数，如果没有初始值从1开始执行回调函数，累计值就是每一次回调函数的return的值**
如果是稀疏数组不会对不存在的元素执行回调函数

`reduceRight` 执行过程和`reduce`一致，只是索引从高到低开始

`sort` 接受一个比较函数作为参数。如果不传比较函数会将元素转换为字符串的Unicode位点进行比较。
如果传入比较函数，比较函数接收`第一个比较的值，第二个比较的值`作为参数，如果两个值相减，小于0的1和2参数位置调换，如果等于0不变，如果大于0，第二个参数在第一个参数后面
该方法返回值是原来的数组，如果重新定义一个变量赋值给该方法执行后的返回值内存地址指向的也和原数组<br/>
如果是稀疏数组不会对不存在的元素执行回调函数

## 常用的数组处理方法
### 去重
```javascript
function uniqueByReduce(array) {
    return array.reduce((prev, current) => {
        return prev.includes(current) ? prev : [...prev, current]
    }, [])
}

function uniqueByFilter(array) {
    return array.filter((item, index) => {
        return array.indexOf(item) === index
    })
}
```
- 空间复杂度O(n)前提下去重
```javascript
function uniqueByPerformance(array) {
    // 先把数组升序排序
    array.sort((a,b) => a-b)
    let i = 0, j = 0
    while(i < array.length) {
        if (array[i] !== array[j]) {
            j++
            array[j] = array[i]
        }
        i++
    }
    array.length = j + 1
}
```

### 扁平化
使用递归的方式实现
```javascript
    let flatten = (array) => {
        let res = []
        let recursive = (array) => {
        array.forEach(item => {
            if (Array.isArray(item)) {
            recursive(item)
            } else {
            res.push(item)
            }
        })
        }
        recursive(array)
        return res
    }
```
使用reduce的方式实现
```javascript
    function flattenByPerformance(array) {
        return array.reduce((prev, item)=> {
        return Array.isArray(item) ? [...prev, ...flattenByPerformance(item)] : [...prev, item]
        }, [])
    }
```