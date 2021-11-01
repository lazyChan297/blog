# 动画
css3新特性中transition、animation、transform属性

## transition
在引用该属性前，css是没有时间轴的所有状态的变化都是即时完成，增加该属性后可以为状态的变化增加过渡效果

**属性值说明**
- transition-property 过渡效果的属性
- transition-duration 过渡时间
- transition-delay 延迟时间
- transition-timing-function 速度变化函数
    - linear 匀速
    - ease-in 加速
    - ease-out 减速
    - cubic-bezier自定义速度

**使用限制**
- 需要事件触发，无法在网页加载是自动发生
- 是一次性的，不能重复发生，除非重复触发
- 只能定义两个状态，即开始和结束
- 一条过渡效果规则只能定义一个属性变化

## Animation
Animation可以解决transition属性的使用限制问题

`animation: 动画名 持续时间 速度变化函数 延迟时间 播放次数 播放方向（状态1->状态n) 动画播放结束后停留位置`
- animation-name | 动画名
- animation-duration 持续时间 | 数值+秒
- animation-timing-function 速度变化函数 与transition一致
- animation-delay 延迟时间
- animation-iteration-count 播放次数 | `infinite无限循环`
- animation-direction 播放方向
    - `normal` 播放结束后回到起点重新开始
    - `alternate` 交替运行 起点->终点->终点->起点
    - `reverse` 终点->起点
    - `alternate-reverse` 终点->起点->起点->终点
- animation-fill-mode 动画播放结束后停留位置
    - `none` 播放结束后回到无动画状态
    - `forwards` 播放结束后停留最后一个状态
    - `backwards` 播放结束后回到第一帧
    - `both` 根据animation-direction轮流应用forwards和backwards规则

**创建动画**
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
         
## transform
支持`rotate(旋转)`，`scale(缩放)`，`translate(移动)`，`skew(倾斜)`四个值实现动画，如果想要定义多个值可以排列书写，变化的属性顺序和书写的顺序一致，<br/>
**需要注意的是，当`rotate`后，元素的坐标轴也会随着旋转，如果还需要对该元素位移，那么位移的方向也是随着旋转后的坐标轴移动，如果位移的方向不想随着坐标轴旋转，那么记得要先位移，再旋转**


## 动画性能
使用以下属性不会引起浏览器回流和重绘，而是开启GPU线程绘制，对渲染性能有了很大的提升
1. `transform`
2. `opacity`
3. `filter（滤镜）`，属性值：`blur() - 模糊`  `brightness() - 亮度` <br/> 
    `contrast() - 对比度` `drop-shadow() - 阴影` `grayscale() - 灰度` <br/>
    `hue-rotate() - 色相旋转` `invert() - 反色` `opacity() - 透明度`  <br/>
    `saturate() - 饱和度` `sepia() - 褐色`

## 参考链接
1. [CSS动画与GPU](http://www.ayqy.net/blog/css%E5%8A%A8%E7%94%BB%E4%B8%8Egpu/)
2. [深入浏览器理解CSS animations 和 transitions的性能问题](http://sy-tang.github.io/2014/05/14/CSS%20animations%20and%20transitions%20performance-%20looking%20inside%20the%20browser/)

