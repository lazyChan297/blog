# 数组与矩阵

## Array



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