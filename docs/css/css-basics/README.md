# CSS

## 选择器
**优先级**

`!important` -> `内联（1000）` -> `id(0100)` -> `类,伪类,属性选择器（0010）` -> `元素,伪元素（0001）` -> `通配符(0000)` 
如果权重相加一致，那么就以最新的样式表为准

- 伪类选择器，选择的是真实存在dom结构上，且满足逻辑判断标识的元素，例如第一个子元素 `:first-child`

- 伪元素，是不存在dom结构中添加的虚拟元素，例如`::after`和`::before`用来在元素节点前后添加一个虚拟的元素，`::placeholder`是选择input标签的文字占位符
[详细的列表可以查看该规范](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Building_blocks/Selectors/Pseudo-classes_and_pseudo-elements)

**解析顺序**
从右到左解析，例如，`.list li {}` 会先匹配li标签，接着匹配类名list
如果从左到右解析，从css dom的根节点开始查找，当匹配到某一个子节点不符合时回溯到根节点重新查询这样会使查询的时间增加很多，如果从右到左解析，从则从一开始就筛选掉很多不匹配规则的元素，明显的减少了性能上的损耗

## 文档流
**文档标准流**
所有的节点默认遵循文档标准流，行内与元素从左到右排列，如果宽度不够自动换行；块级元素独占一行，自上而下排列

**脱离文档标准流**
1. 元素浮动
2. 绝对定位和固定定位

**脱离文档标准流的影响** 虽然脱离标准流可以实现一些定位需求，但是会造成一些副作用
1. 假如浮动元素没有占满父元素高度，浮动元素的同级不浮动元素高度超过浮动元素会出现围绕的情况，跑到浮动元素的下方，造成布局混乱
2. 浮动的元素之间会互相贴靠
3. 如果浮动元素没有定义宽高，那么它的高度就会变成实际内容的宽高
4. 元素浮动后，是不会填充父元素的高度的

**清除浮动解决脱标的影响**
1. 给父元素设置高度，但是如果父元素的高度是由子元素填充的话这个方法会不够灵活
2. 给父元素设置overflow: hidden;
3. 给父元素增加一个伪元素
4. 在浮动元素同级下增加一个空元素，设置样式`clean:both`表示当前元素两边都不允许有浮动元素

## BFC块级格式化上下文
是css盒模型的渲染模式，指的是当前模型形成一个独立的渲染区域里面的元素不会影响外部

**创建方法**
1. `float`的值不是`none`
2. `position`的值不是`static`或`relative`
3. `display: table-cell | table-caption | inline-block`
4. 除了overflow: visible以外的值

**布局规则**
1. 解决margin重叠，内部的元素会在垂直方向上排列，排列的间隔由上下两个元素之间的margin会折叠以值大的为准
2. 解决float引起的重叠，计算bfc高度时，float元素的高度也会包含在内<br/>
   由此可以实现两栏布局/三栏布局，但是有更好的实现方式（flex布局）
3. 里面的元素与外面的元素相互独立，不受影响 <br />
   
## 盒子模型
CSS中每一个元素被视为一个矩形盒子，盒子包含了`padding` `border` `content` `margin`
- **标准盒子模型** 默认值，`box-sizing: content-box`设置width只会赋值给`content`，不包含`padding` `border`的值，height同理

- **怪异盒子模型** `box-sizing:border-box`，设置width包含了`padding` `border` `content`，`content = width - padding*2 - border*2`的值，高度同理<br>

- **`auto`值的计算** 块级盒子满足该等式
`margin-left`+`border-left-width`+`padding-left`+`width`+`padding-right`+`border-right-width`+`margin-right`=`width of containing block`<br/>
当且仅当有一个其中某一个属性值为auto时，该auto的值令该等式成立，等于<br/>
`margin-left` = `width of containing block`-`border-left-width`-`padding-left`-`width`-`padding-right`-`border-right-width`-`margin-right`

## 关于属性的百分比属性值
对不同的属性设置百分比有不同的基准
| 属性名|  基准|
| ---- | ---- |
| translate| 自身的宽高|
| margin/padding/left/right| 父级的width| 
| top/bottom/height| 父级的height|
| line-height|自身字体大小|