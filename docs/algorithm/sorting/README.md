# 排序算法

## 快速排序
1. 确定一个基准点用来和其它数字比较。选用数组最后一个数字作为基准点
2. 定义一枚`i`指针，起始位置在当前数组的起始位置-1
3. 遍历数组，如果元素小于基准点，i++，然后把i的位置和当前遍历的位置做交换，遍历结束后，i的位置就是最后一个小于基准点的位置
4. 然后把基准点和i+1的位置做交换，
此时得到的数组排序就是基准点左边全是小于它的，右边全是大于它的,可以把数组理解分为两段，[小于基准点的, 基准点,大于基准点的]
5. 再把[小于基准点的] 和 [大于基准点的] 重复 1-5 步骤分割，也就是递归，直到起始每次数组的长度为1

### swap
根据以上方法可以知道要实现一个swap函数,作为函数交换
```javascript
function swap(arr, i, j) {
    cont temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
}
```

### divide
根据以上方法还可以知道要实现一个divide函数，作为在遍历时分割
```javascript
function divide(arr, startIndex, length) {
    // i指针开始时在起始位置的前一位
    let i = startIndex - 1
    // 找到基准点
    let point = arr[length - 1]
    for (let j = startIndex; j < length - 1; j++) {
        if (arr[j] <= point) {
            i++
            swap(arr, i,j)
        }
    }
    // 把基准点交换到最后一个小于它的数后面
    swap(arr, i+1,length-1)
    // 返回基准点的位置，为下半段遍历的起始点求值
    return i+1
}
```
### quickSort
```javascript
    function quickSort(arr, startIndex = 0, length) {
        length = length || arr.length
        if (startIndex < length - 1) {
            const newStartIndex = divide(arr, startIndex, length)
            quickSort(arr, startIndex, newStartIndex)
            quickSort(arr, newStartIndex + 1, length)
        }
        return arr
    }
```

可以通过以下链接测试函数
[quickSort](https://bigfrontend.dev/zh/problem/implement-Quick-Sort)