# 排序算法

## 快速排序
1. 定义两枚指针，左指针初始值为0，右指针初始值为数组长度
2. 找出左右指针中间的元素作为基准值比较
3. 在满足左指针小于等于右指针的条件下循环
  - 如果左指针的值小于基准值左指针向右移动，直到遇到大于等于基准值时停止
  - 如果右指针的值大于基准值右指针向左移动，直到遇到小于基准值时停止
  - 如果左右两边指针相遇，左右两枚指针指向的值交换位置

```javaScript
```

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

## 冒泡排序
遍历数组对所有的元素和它相邻的元素比较，例如
`[4,2,5,-1]` `4`和`2`比较， `4`比2大，则交换得到 `[2,4,5,-1]`
接着4和5比较，不需要交换
5和-1比较，5比-1大，则交换得到 [2,4,-1,5]
第一轮遍历结束后可以把最大的元素放到最右边，按照这个逻辑
第二次遍历结束可以把第二大的元素放到最右2，
第n次遍历得到第n大的元素放到右n的位置，
而且经过前面的遍历可以对每次遍历的长度减一

那么对长度的数组遍历n*n次就可以实现冒泡排序
```javascript
function bubbleSort(arr) {
  for(let i =0; i<arr.length;i++) {
    for (let j =0;j<arr.length-i;j++) {
      if (arr[j] > arr[j + 1]) {
        const swap = arr[j]
        arr[j] = arr[j+1]
        arr[j+1] = swap
      }
    }
  }
  return arr
}
```
可以通过这个链接测试函数
[bubbleSort](https://bigfrontend.dev/zh/problem/implement-Bubble-Sort)