# css的布局方式

## flex布局

| 属性名          | 含义                                               | 属性值                                                       |
| --------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| flex-direction  | 决定主轴的排列方式                                 | row横向（默认）;row-reverse横向，起点在右；column纵向；column-reverse纵向，起点在下 |
| flex-wrap       | 排列是否换行                                       | nowrap不换行（默认）；wrap换行；wrap-reverse换行，第一行在下方 |
| flex-flow       | flex-direction和flex-wrap的简写                    | row nowrap；（默认）                                         |
| justify-content | 在主轴上的对齐方式                                 | flex-start左对齐（默认）；flex-end右对齐；center居中；space-between；两端对齐，元素间隔相等；space-around元素两侧间隔相等 |
| align-items     | 在纵轴上的对齐方式                                 | flex-start与纵轴起点对齐；flex-end与纵轴终点对齐；center与纵轴中间对齐；baseline与项目第一行文字对齐；stretch如果项目未设置高度或设为auto，将占满整个容器的高度（默认）。 |
| align-content   | 多根轴线情况下的对齐方式，只有一根轴线时该属性无效 | flex-start与纵轴起点对齐；flex-end与纵轴终点对齐；center与纵轴中间对齐；space-between与交叉轴两端对齐，轴线之间的间隔平均分布；space-around每根轴线两侧的间隔都相等，轴线之间的间隔比轴线与边框的间隔大一倍；stretch轴线占满整个交叉轴（默认值） |
| order           | 元素排列顺序                                       | 数值越小，排序越前，默认是0                                  |
| flex-grow       | 元素放大比例                                       | 默认值0，即使存在剩余空间，也不放大；1：等分剩余空间；2：等分的空间为两倍 |
| flex-shrink     | 元素缩小比例                                       | 默认值1，如果空间不足会缩小；0:空间不足时不缩小              |
| flex-basis      | 分配多余空间时，分配主轴的空间                     | 默认值auto，元素原本的大小；也可以设置npx                    |
| flex            | flex-grow和flex-shrink和flex-basis的简写           | 默认值0 1 auto                                               |
| align-self      | 覆盖父元素的align-items                            | 默认值aotu，继承父元素，如果没有父元素，等同stretch；其余属性值与align-items一致 |

## grid布局
父元素属性
grid-template-columns: 有几个值代表有几列，对应的值就是该列的高度
grid-template-rows: 有几个值代表有几行，对应的值就是该行的宽度
```css
.content {
    display: grid;
    grid-template-columns: 100px 100px 100px;
    grid-template-rows: 50px 50px;
}
```
子元素属性
grid-row-start: n 表示用网格的第n条横轴开始定位
grid-row-end: n 表示用网格的第n条横轴结束定位
grid-column-start: n 表示用网格的第n条纵轴轴开始定位
grid-column-end: n 表示用网格的第n条横轴开始定位