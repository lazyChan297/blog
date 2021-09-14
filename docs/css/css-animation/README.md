# CSS3动画

## CSS3实现的几种方式

### transform
对使用该属性的元素进行`rotate(旋转)`，`scale(缩放)`，`translate(移动)`，`skew(倾斜)`<br/>
如果想要定义多个值可以排列书写，变化的属性顺序和书写的顺序一致，<br/>
需要注意的是，当`rotate`后，元素的坐标轴也会随着旋转，如果还需要对该元素位移，<br/>
那么位移的方向也是随着旋转后的坐标轴移动<br />
如果位移的方向不想随着坐标轴旋转，那么记得要先位移，再旋转
```css
.node {
    transform: rotate(50deg) translate(100px 100px);
}
```
### transition
对定义的`transform`属性实现过渡效果，从而实现真正的动画
`transition: name time linear delay`<br/>
name属性可以定义很多种，直接宽高或者坐标值，也可以是定义好的`transform`属性


### animation
使用方式
```css
    .animationNode {
        animation: MyAnimation 10s linear;
    }
    @keyframes MyAnimation {
        0% {
            transform: translate(0,0)
        }
        50% {
            transform: translate(100px 100px)
        }
        100% {
            transform: translate(200px 200px)
        }
    }
```

## 性能提升的原因
::: tip
##### 浏览器主线程负责
    - 运行js
    - 获取DOM tree、CSS tree、layout、paint(生成一张or多张位图)
    - 将位图提交给compositor（合成线程）
##### 合成线程
    -  通过 GPU将位图绘制到屏幕上
    - 通知主线程更新页面中可见或即将变成可见的部分的位图
    - 计算出页面中哪部分是可见的
    - 计算出当你在滚动页面时哪部分是即将变成可见的
    - 当你滚动页面时将相应位置的元素移动到可视区域
:::

**所以`transform`实现的动画一直在compositor（合成线程）上运行，不会占用主线程，也不会引起浏览器的回流和重绘制。**

### 可以开GPU线程绘制的属性
1. `transform`
2. `opacity`
3. `filter（滤镜）`，属性值：`blur() - 模糊`  `brightness() - 亮度` <br/> 
    `contrast() - 对比度` `drop-shadow() - 阴影` `grayscale() - 灰度` <br/>
    `hue-rotate() - 色相旋转` `invert() - 反色` `opacity() - 透明度`  <br/>
    `saturate() - 饱和度` `sepia() - 褐色`

### 需要注意的地方
GPU绘制的位图需要由主线程提交过来，也可以理解为占用CPU将元素打包发送到合成线程，<br />
所以打包的大小和数量决定了GPU消耗的内存。

## 参考链接
1. [CSS动画与GPU](http://www.ayqy.net/blog/css%E5%8A%A8%E7%94%BB%E4%B8%8Egpu/)
2. [深入浏览器理解CSS animations 和 transitions的性能问题](http://sy-tang.github.io/2014/05/14/CSS%20animations%20and%20transitions%20performance-%20looking%20inside%20the%20browser/)

