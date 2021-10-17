# 布局

## Flex
### 父属性说明
- **flex-direction** 决定主轴的排列方式，
    1. row横向（默认）、column纵向
    2. row-reverse（横向，起点在右）、column-reverse（纵向，起点在下） 

- **justify-content** 主轴的对齐方式
    1. flex-start左对齐（默认）
    2. flex-end右对齐
    3. center居中
    4. space-between；两端对齐，元素间隔相等
    5. space-around元素两侧间隔相等

- **align-items** 与主轴垂直交叉的轴线的对齐方式
    1. stretch如果元素未设置高度或设为auto，将占满整个容器的高度（默认）
    2. flex-start 与该轴起点对齐
    3. flex-end 与该轴终点对齐
    4. center 与该轴中间对齐
    5. baseline与第一行文字对齐

- **align-content** 多根与主轴垂直交叉的轴线对其方式，如果只有一根轴该属性无效
    1. stretch轴线占满整个交叉轴（默认值） 
    2. flex-start与纵轴起点对齐
    3. flex-end与纵轴终点对齐
    4. center与纵轴中间对齐 
    5. space-between与交叉轴两端对齐，轴线之间的间隔平均分布
    6. space-around每根轴线两侧的间隔都相等，轴线之间的间隔比轴线与边框的间隔大一倍

- **flex-wrap** 决定主轴排列是否换行
    1. nowrap不换行（默认）
    2. wrap换行
    3. wrap-reverse换行，第一行在下方

- **flex-flow** `flex-direction`和`flex-wrap`的合并，默认值是`row nowrap`

### 子属性说明

- **flex-grow** 元素放大比例
    - 默认值0，存在剩余空间不放大
    - 计算法则
        - `剩余空间 = 父容器空间 - 所有子项空间的总和`
        - `可伸展大小 = 剩余空间 / 所有子元素的系数总和`
        - `子项伸展后的空间 = 子项自身的空间 + 子项伸展系数 * 可伸展大小`
- **flex-shrink** 元素缩小比例
    - 默认值1，如果空间不足会以1为系数收缩，`收缩后的空间 = 当前子项空间 - 1 * （溢出的空间/所有子项个数）`
    - 0，空间不足时也不会对子元素收缩
    - 计算法则
        - `溢出的空间 = 所有子项空间加起来的总和 - 父容器空间`
        - `权重 = 所有子项空间*该子项收缩系数的总和`
        - `当前子元素收缩空间 = 溢出的空间 * 当前子元素空间 * 收缩系数 / 权重`
        - `收缩后的空间 = 当前子元素原本空间 - 当前子元素收缩空间`

- **flex-basis** 在不伸缩情况下子元素基准的大小，横向排列时代表宽度，纵向排列代表高度，如果设置了百分比则以父容器的空间为基准，默认是`auto`，代表由自身内容大小决定

- **flex** `flex-grow` `flex-shrink` `flex-basis` 三个属性的合并缩写
    - 单值语法
        - 只有1个无单位数字时，值对应的是`flex-grow`，其它值默认
        - 只有1个值有单位数字时，值对应的是`flex-basis`，其它值默认
        - 只要1个关键字值时，`none` => `0 0 auto`，`auto` => `1 1 auto`，`initial` => `0 1 auto`
    - 双值语法
        - 1个无单位数字，1个有单位数字，对应的值是`flex-grow`，`flex-basis`
        - 都是无单位数字，对应的值是`flex-grow`，`flex-shrink`
- **align-self** 覆盖父元素的align-items，属性值与align-items一致

## Grid
### 父元素属性
- **grid-template-columns** 有几个值代表有几列，对应的值就是该列的列宽，`repeat(n, 100px)`等于重复定义n个100px的值
- **grid-template-rows** 有几个值代表有几行，对应的值就是该行的行高，`repeat(n, 100px)`等于重复定义n个100px的值

### 子元素属性
- **grid-row-start/grid-row-end/grid-column-start/grid-column-end** 从网格的第n条横轴/纵轴，开始/结束定位
