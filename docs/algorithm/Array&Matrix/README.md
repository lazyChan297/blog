# 数组与矩阵

## Array

### 快速排序
```javascript
function MySort(arr) {
    return QuickSort(arr, 0, arr.length-1)
}
function QuickSort(arr,left,right) {
    if (arr.length > 1) {
        let index = divide(arr, left, right)
        if (left < index - 1) {
            QuickSort(arr,left, index-1)
        }
        if (right > index) {
            QuickSort(arr,index, right)
        }
    }
    return arr
}
function divide(arr,left,right) {
    let mid = arr[Math.floor((right+left)/2)]
    let i = left, j = right
    while(i <= j) {
        while(arr[i] < mid) {
            i++
        }
        while(arr[j] > mid) {
            j--
        }
        if (i <=j) {
            [arr[i], arr[j]] = [arr[j], arr[i]]
            j--
            i++
        }
    }
    return i
}
```

### 冒泡排序
```javascript
function mp(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i; j++) {
            if (arr[j] > arr[j+1]) {
                let temp = arr[j]
                arr[j] = arr[j+1]
                arr[j+1] = temp
            }
        }
    }
    return arr
}
```

### 寻找第K大
直接用快排解决
```JavaScript
function findKth( a ,  n ,  K ) {
    // write code here
    function divide(arr, l, r) {
        let mid = arr[Math.floor((r+l)/2)]
        let i = l, j = r
        while(i <= j) {
            while(mid > arr[i]) {
                i++
            }
            while(mid < arr[j]) {
                j--
            }
            if (i <= j) {
                [arr[i], arr[j]] = [arr[j], arr[i]]
                i++
                j--
            }
        }
        return i
    }
    function quickSort(arr, l,r) {
        if (arr.length > 1) {
            let index = divide(arr, l ,r)
            if (l < index-1) {
                quickSort(arr,l,index-1)
            }
            if (index < r) {
                quickSort(arr,index,r)
            }
        }
    }
    quickSort(a,0,n-1)
    return a[n-K]
}
```

### 旋转数组
在空间复杂度O(1)的前提下，使用环状替换的方法旋转。
- 总共遍历a圈，每圈长度是n，每圈遍历b个元素，每个元素移动k步，a*n = k*b，当一圈结束后就要开始下一次遍历所以a要尽可能小，所以a*n是n和k的最小公倍数
- 每圈遍历的个数 = n和k的最小公倍数 / k
- 为保证每个元素都会被遍历，遍历的次数= `n/每圈遍历的个数` = `n/(n和k的最小公倍数/k)`
```javascript
function rotate(arr, k) {
    const gcd = (x, y) => y ? gcd(y, x%y): x
    let n = arr.length
    const count = gcd(k,n)
    for (let start = 0; start < count; i++) {
        // 当前遍历到的索引
        let current = start
        // 当前元素
        let prev = arr[start]
        do{
            // 当前元素要移动到的位置
            let next = (current + k) % n
            // 缓存当前元素要移动到的位置原本的数字，作为下一次旋转
            let temp = arr[next]
            // 把当前元素移动到k的位置
            arr[next] = prev
            // 当前元素已经旋转，替换成缓存的元素
            prev = temp
            // 当前元素已经旋转，把对应的索引值替换成缓存的元素的索引值
            current = next
        }while(start !== current) 
    }
}
```

### 合并两个有序数组
1. 使用两枚指针，在两枚指针都小于指定的合并索引的条件下循环，获取两枚指针当前指向的值比较，取出小的值push到新的数组中
2. 如果某一枚指针等于它的合并索引后，取出另一个数组的指针指向的值添加到数组中
3. 添加到新数组的索引是两枚指针相加-1，-1是因为为移动数组下一次循环指针加1，但是实际放入新数组时索引应该是两枚指针和-1
4. 遍历新数组，把对应的值更新到nums1上
```javascript
    var merge = function(nums1,m, nums2, n) {
        let p1 = 0,p2=0
        // 合并后的数组
        let sorted = Array.from(m+n).fill(0)
        while(p1 < m || p2 < n) {
            // 合并数组对应的索引的元素
            let current
            if(p1 === m) {
                current = nums2[p2++]
            } else if (p2 === n) {
                current = nums1[p1++]
            } else if (nums1[p1] < nums2[p2]) {
                current = nums1[p1++]
            } else {
                current = nums1[p2++]
            }
            sorted[p1+p2-1] = current
        }
    }
    for (let i = 0; i <sorted.length;i++) {
        nums[i] = sorted[i]
    }
    return nums
```

### 删除数组重复元素
```javascript
var removeDuplicates = function(nums) {
    if (nums.length === 0) return []
    let i = 0
    for (let j = 0; j < nums.length; j++) {
        if (nums[i] !== nums[j]) {
            i++
            nums[i] = nums[j]
        }
    }
    return i + 1
};
```

### 数据流中的中位数
- 实现两个方法Insert和GetMedian
    - Insert(num) 负责插入数据，插入后保证数据是有序的
    - GetMedian 返回数组的中位数
```javascript
let arr = []
function Insert(num) {
    if (arr.length === 0) arr.push(num)
    else {
        // 将数据插入后进行排序
        arr.push(num)
        // 获取数据插入前最后一个元素的索引,从这个位置开始遍历
        // 遇到比num大的数据，往后移动1位，
        // 直到遇到比num小的数字或i=0时结束遍历
        let i = arr.length - 2
        for (i; i >=0&& num<arr[i]; i--) {
            arr[i+1] = arr[i]
        }
        // 重新在正确的位置插入num
        arr[i+1] = num
    }
}
function GetMedian() {
    let len = arr.length
    if (len % 2 === 0) {
        let mid = len/2
        return (arr[mid] + arr[mid-1])/2
    } else {
        let mid = Math.floor(len/2)
        return arr[mid]
    }
}
```

### 最大数
给定一个长度为n的数组nums，数组由一些非负整数组成，现需要将他们进行排列并拼接，每个数不可拆分，使得最后的结果最大，返回值需要是string类型，否则可能会溢出
```javascript
function solve(nums) {
    // 对数组进行排序，排序的规则是相邻的两个元素正反字符串拼接，把拼接后大的字符串移动到前面
    nums.sort((a,b) => {
        a = a.toString()
        b = b.toString()
        // a+b 后面的数+前面的数, b+a 前面的数+后面的数, 如果a+b < b+a, 那么b在a前面返回1，否则返回-1，使a在前
        return a+b < b+a ? 1 : -1
    })
    // 排序后就得到最大的字符串数组，转换成字符串
    let res = nums.join('')
    if (Number(res) === 0) return '0'
    return res
}
```

### 合并区间
给出一组区间，请合并所有重叠的区间。例如`[[10,30],[20,60],[80,100],[150,180]]` 去掉重叠后变为 `[[10,60],[80,100],[150,180]]`
0. 先按照每一个元素的start升序排列
1. 第i个元素的start>第i-1个元素的end，证明没有重叠，跳过本次循环（从第1个元素开始遍历）
2. 第i个元素的start<=第i-1个元素的end，证明有重叠，第i个元素的start更新为第i-1个元素的start
3. 第i个元素的end小于第i-1个元素的end，把第i个元素的end更新为第i-1个元素的end
4. 因为已经更新了第i个元素的start，所以第i-1个元素是多余的，使用splice删除
```javascript
function merge( intervals ) {
    intervals.sort((a,b) => a.start - b.start)
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i].start > intervals[i-1].end) continue
        intervals[i].start = intervals[i-1].start
        if (intervals[i].end < intervals[i-1].end) {
            intervals[i].end = intervals[i-1].end
        }
        intervals.splice(--i,1)
    }
}
```

### 最长无重复子数组
比如`[1,3,5,7,9]`的子数组有[1,3]，[3,5,7]等等，但是[1,3,7]不是子数组
```JavaScript
function maxLength( arr ) {
    // key:数组中的元素，value：出现过的索引
    let map = new Map()
    // 当出现重复数字时，j指向它上一次出现的索引值
    let i = -1
    // 最长子数组长度
    let maxLength = 0
    for (let j = 0; j < arr.length; j++) {
        if (map.has(arr[j])) {
            i = Math.max(i, map.get(arr[j]))
        }
        maxLength = Math.max(maxLength, j-i)
        // 更新元素出现的位置
        map.set(arr[j], j)
    }
    return maxLength
}
```

## Matrix

### 螺旋矩阵打印
```javascript
function solve(grid) {
    if (!grid || !grid.length) return null
    let row = grid.length, col = grid[0].length
    // 创建矩阵四个角的指针
    let rowStart = 0, rowEnd = row-1, colStart = 0, colEnd = col-1
    // 输出打印结果
    let res = []
    while(res.length < row*col) {
        // 左->右，行位置不变，列位置改变，用col的值控制列数变化
        for (let i = colStart; i <=colEnd; i++) {
            res.push(grid[rowStart][i])
        }
        // 最上方的行遍历结束，最上方的行指针下移
        ++rowStart
        // 上->下，列位置不变，行位置改变，用row的值控制行数变化
        for (let i = rowStart; i <=rowEnd; i++) {
            res.push(grid[i][colEnd])
        }
        // 最右的列遍历结束，最右的列左移
        --colEnd
        // 当矩阵只有单行or单列时遍历结束，否则继续下面的遍历
        if (rowStart > rowEnd || colStart > colEnd) break
        // 右->左，行位置不变，列位置改变，用col的值控制列数变化
        for (let i = colEnd; i >=colStart;i-- ) {
            res.push(grid[rowEnd][i])
        }
        // 最下方的行遍历结束，最下方的行上移动
        --rowEnd
        // 下->上，列位置不变，行位置变化，用row的值控制行数变化
        for (let i = rowEnd; i >=rowStart;i-- ) {
            res.push(grid[i][colStart])
        }
        // 最左的列遍历结束，最左的列右移
        ++colStart
    }
    return res
}
```

### 岛屿最大数量
给一个01矩阵，1代表是陆地，0代表海洋， 如果两个1相邻，那么这两个1属于同一个岛。我们只考虑上下左右为相邻。
岛屿: 相邻陆地可以组成一个岛屿（相邻:上下左右） 判断岛屿个数。
```javascript
function solve(matrix) {
    if (!matrix || !matrix.length) return 0
    let rows = matrix.length
    let cols = matrix[0].length
    // 岛屿数量
    let count = 0
    for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j <cols.length; j++) {
            if (matrix[i][j] == 1) {
                count++
                DFS(matrix, i,j)
            }
        }
    }
    return count
}
function DFS(matrix, i, j) {
    if (matrix[i][j] == 0 || i >= matrix.length || i < 0 || j <0|| j>=matrix[0].length) return false
    // 更新已经探索过的陆地
    matrix[i][j] = 0
    DFS(matrix, i-1, j)
    DFS(matrix, i+1,j)
    DFS(matrix, i, j-1)
    DFS(matrix, i, j+1)
}
```

### 岛屿最大面积
给定一个由 0 和 1 组成的非空二维数组 grid ，用来表示海洋岛屿地图。
一个 岛屿 是由一些相邻的 1 (代表土地) 构成的组合，这里的「相邻」要求两个 1 必须在水平或者竖直方向上相邻。你可以假设 grid 的四个边缘都被 0（代表水）包围着。
找到给定的二维数组中最大的岛屿面积。如果没有岛屿，则返回面积为 0 。
```javascript
var maxAreaOfIsland = function(grid) {
    if (!grid || !grid.length) return 0
    let rows = grid.length
    let cols = grid[0].length
    // 最大面积，默认是0
    let max = 0
    for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j <cols.length; j++) {
            if (gird[i][j] == 1) {
                // 比较出最大的岛屿面积
                let _max = DFS(matrix, i,j)
                max = Math.max(_max, max)
            }
        }
    }
    return max
}
function DFS(matrix, i, j) {
    if (matrix[i][j] == 0 || i >= matrix.length || i < 0 || j <0|| j>=matrix[0].length) return false
    // 更新已经累加过的岛屿面积
    matrix[i][j] = 0
    // 当前岛屿面积为1，用于与上下左右相邻区域累计
    let result = 1
    // 左
    result += DFS(matrix, i-1, j)
    // 右
    result +=  DFS(matrix, i+1,j)
    // 上
    result +=  DFS(matrix, i, j-1)
    // 下
    result +=  DFS(matrix, i, j+1)
    return result
}
```


### 正方形最大面积
```javascript
function solve(grid) {
    // dp[i][j]为当以[i,j]作为正方形右下角坐标时的正方形面积
    let dp = []
    let rows = grid.length
    let cols = grid[0].length
    // 正方形边长，默认是0
    let max = 0
    for (let i = 0; i < rows.length; i++) {
        // dp增加一行，防止报错
        dp.push([])
        for (let j = 0; j <cols.length; j++) {
           if (grid[i][j] == 1) {
               // 如果是第一行或第一列的正方形面积为1
               if (i == 0 || j == 0) {
                   dp[i][j] = 1
               } else {
                   dp[i][j] = Math.min(dp[i-1][j],dp[i][j-1], dp[i-1][j-1]) + 1
               }
           } else {
               dp[i][j] = 0
           }
           if (dp[i][j] > max) max = dp[i][j]
        }
    }
    return max*max
}
```

### 二维数组中查找某个元素
如果存在返回true，否则返回false<br/>
因为数组是从左到右递增的，所以逐行从右到左遍历，如果当前元素小于target，跳过本行循环；
```javascript
function Find(target, array) {
    for (let i = 0; i< array.length; i++) {
        for (let j = array[0].length-1; j >= 0; j--) {
            if (array[i][j] === target) return true
            else if (array[i][j] > target) continue
            else break
        }
    }
    return false
}
```

### 求路径
一个机器人在m×n大小的地图的左上角（起点）。
机器人每次可以向下或向右移动。机器人要到达地图的右下角（终点）。
可以有多少种不同的路径从起点走到终点？
```javascript
function uniquePaths( m ,  n ) {
    let dp = []
    for (let i = 0; i < m; i++) {
        dp.push([])
        for (let j = 0; j< n; j++) {
            if (i === 0) {
                // 第一行的元素，只有往下走一种路径
                dp[i][j] = 1
                continue
            }
            if (j === 0) {
                // 第一列的元素，只有往右走一种路径
                dp[i][j] = 1
                continue
            }
            dp[i][j] = dp[i-1][j]+dp[i][j-1]
        }
    }
    return dp[m-1][n-1]
}
```

### 矩阵的最小路径和
给定一个 n * m 的矩阵 a，从左上角开始每次只能向右或者向下走，最后到达右下角的位置，路径上所有的数字累加起来就是路径和，输出所有的路径中最小的路径和
```javascript
function minPathSum( matrix ) {
    let row = matrix.length, column = matrix[0].length
    // 保存所有终点位置为i,j的路径和的二维数组，默认值全部为0
    let dp = Array.from(new Array(row), () => new Array(column).fill(0))
    // i=0,j=0的路径和必然为matrix[0][0]的值
    dp[0][0] = matrix[0][0]
    for (let i = 0; i < row; i++) {
        for (let j = 0; j<column; j++) {
            if (i===0&&j===0) continue
            if (i===0) {
                dp[i][j] = dp[i][j-1] + matrix[i][j]
            } else if (j === 0) {
                dp[i][j] = dp[i-1][j] + matrix[i][j]
            } else {
                dp[i][j] = Math.min(dp[i-1][j]+matrix[i][j], dp[i][j-1] + matrix[i][j])
            }
        }
    }
    return dp[row-1][column-1]
}
```