# 动态规划

## 买卖股票的最佳时机
假设你有一个数组prices，长度为n，其中prices[i]是股票在第i天的价格，请根据这个价格数组，返回买卖股票能获得的最大收益
```javascript
function maxProfit( prices ){
    let min = prices
    // 最大收益，默认值是0
    for (let i = 0; i < prices.length; i++) {
        if (prices[i] < min) {
            // 找到比当前价格低的股票
            min = prices[i]
        } else if (prices[i] - min > max) {
            // 当天价格股票-最低价格股票大于缓存的最大收益，更新最大收益
            max = prices[i] - min
        }
    }
    return max
}
```

## 买卖股票的最好时机(无限次交易）
假设你有一个数组prices，长度为n，其中prices[i]是某只股票在第i天的价格，请根据这个价格数组，返回买卖股票能获得的最大收益
1. 你可以多次买卖该只股票，但是再次购买前必须卖出之前的股票
2. 如果不能获取收益，请返回0
3. 假设买入卖出均无手续费

```javascript
function maxProfit(prices) {
    // 所有交易累计的收益总和
    let res = 0
    // 从第二天开始剪去前一天的股票价格计算收益，和0比较如果小于0自然是亏损，大于0则累加当天的收益
    for (let i = 1; i <prices.length;i++) {
        res += Math.max(prices[i] - prices[i-1], 0)
    }
    return res
}
```

## 换钱的最少货币数
```javascript
function minMoney( arr ,  aim ) {
    // 把所有的解法分解成数组保存，aim对应有aim+1种解法，每种解法初始值都是一个非法值aim+1
    let dp = new Array(aim + 1).fill(aim+1)
    // dp[0]设为1是为了当货币数与arr中提供的货币面值相等时作为初始值累加使用，每次用掉1张货币所以+1
    dp[0] = 0
    // 遍历货币数组，
    for (let i = 0; i <= arr.length; i++) {
        // 遍历全部的解法中与提供的货币面值数组是否有匹配
        for (let j = arr[i]; j <= aim; j++) {
            // 对应的dp[j]的值
            dp[j] = Math.min(dp[j], dp[j-arr[i]]+1)
        }
    }
    // 如果最后一个解法是非法值表示无解，否则取最后一个
    return dp[aim] === aim + 1 ? -1 : dp[aim]
}
```

## 最长递增子序列长度
```javascript
function LIS(arr) {
    let res = [arr[0]]
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > res[res.length-1]) {
            res.push(arr[i])
        } else {
            let l = 0, r = res.length-1
            while(l<=r) {
                let mid = Math.floor((r+l)/2)
                if (res[mid] > arr[i]) {
                    r = mid-1
                } else if(res[mid] < arr[i]) {
                    l = mid+1
                } else {
                    l = r
                    break
                }
            }
            res[l] = arr[i]
        }
    }
    return res.length
}
```

## 最长递增子序列
```javascript
function LIS( arr ) {
    // write code here
    if (!arr.length) return []
    let res = [arr[0]]
    let dp = new Array(arr.length).fill(1)
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > res[res.length-1]) {
            res.push(arr[i])
            dp[i] = res.length
        } else {
            let left = 0, right = res.length-1
            while(left <= right) {
                let mid = Math.floor((right+left)/2)
                if (res[mid] > arr[i]) {
                    right = mid-1
                } else if (res[mid] < arr[i]) {
                    left = mid + 1
                } else {
                    left = right
                    break
                }
            }
            res[left] = arr[i]
            dp[i] = left+1
        }
    }
    let resLen = res.length
    let index = dp.length - 1
    let result = []
    while(resLen > 0) {
        if (dp[index] === resLen) {
            result.unshift(arr[index])
            resLen--
        }
        index--
    }
    return result
}}
```