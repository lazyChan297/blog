# Grid布局
网格布局方式可以轻松的将容器划分成`行`和`列`产生单元格，同时可以指定单元格的样式，轻易实现二维布局

## 容器属性
- **grid-template-columns/rows** 有几个值代表有几列/列，对应的值就是该列的列宽/行高，`repeat(n, 100px)`等于重复定义n个100px的值，n也可以是*auto-fill*，表示自动填充，知道容器不能放置为止
- **fr** 表示行/列之间的比例关系单位，例如`grid-template-columns: 1fr 2fr`表示第二列宽是第一列宽的两倍
- **minmax** 表示列宽的取值范围
- **auto** 表示剩余空间的最大宽度，如果设置了max-width那么就是最大宽度的值
- **grid-row/column-gap** 行/列之间的间隔，也可以用`grid-gap` 表示行和列的合并简写
- **grid-template-area** 用于声明容器中的指定区域（指定若干个单元格）
    - ```css
        .container {
            display:flex;
            
            grid-template-areas: 'a b c';
        }
    ```
- **grid-auto-flow** 决定**单元格内容**的排列顺序，默认值是`row`表示先行后列，`column`表示先列后行
- **justify-items** 决定**单元格内容**如何水平排列 `start`| `end` | `center` | `stretch(拉伸,默认占满整个单元格宽度)`
- **align-items** **单元格内容**如何垂直排列 值与justify-items一致
- **place-items** `align-items`和`justify-items`的合并缩写

- **justify-content/align-content** 单元格在容器中的水平/垂直位置，
    - `space-around`每个单元格的两侧间隔相等
    - `space-between`单元格与单元格之间的间隔相等，与容器的边框没有间隔
    - `space-evenly`每个单元格与单元格之间的间隔相等，单元格与容器的边框间隔也相等
- **place-content** `align-content`和`justify-content`的合并简写

## 子元素属性
- **grid-row-start/grid-row-end/grid-column-start/grid-column-end** 单元格左右/上下边框的位置
    - 使用`span`关键字加数值表示左右/上下边框之间跨域多少个单元格 `span 2`
- **grid-area** 指定单元格放置在哪个区域，值就是由容器属性`grid-template-area`定义的值
- **justify-self/align-self/place-self** 决定**单元格内容**的水平垂直排列位置，覆盖容器的`justify-items/align-items/place-items`属性