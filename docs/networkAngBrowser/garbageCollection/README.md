# v8引擎垃圾回收机制

## 垃圾的产生
当堆内存里的对象不再被引用时或者离开执行环境时，可以判断该对象可被回收，所占内存该被释放，这就是垃圾回收的目标对象

## 垃圾回收算法
::: tip 标记清除算法
对对象进行标记，非活动对象被标记后清除 
- 优点：该算法实现简单，仅通过标记就可以对对象进行标识
- 缺点：被清除的空间在堆内存里是不连续的，当内存被释放后重新使用时，需要遍历找出大于等于重新需要分配的内存
:::

::: tip 引用计数算法
通过累积对该对象引用的次数，当次数为0，就会被清除
- 优点：引用计数不会阻塞js线程（标记清除算法会）
- 缺点：该算法基于计算引用次数判断是否需要被清除，计数器本身就占用比较大内存，且无法回收被循环引用的内存
:::
## v8的GC

### 分代式垃圾回收
v8堆内存的划分为新生代空间和老生代空间，针对不同的空间有不同的垃圾回收策略

#### 新老生代空间
- 新生代空间保存内存小、存活时间短的对象
- 老生代空间保存内存大、存活时间长的对象

#### 存活对象的晋升的条件
- 当一个对象经过多次复制后仍然存活，就会被认为是存活周期较长的对象，这时会被移动到老生代空间 <br/>
- 当一个对象的内存超出堆内存的25%时，就会被分配到老生代空间

#### 分代式回收的原因
新生代空间占比小，存活时间短，所以高频率进行垃圾回收，并不会进行长时间阻塞。
老生代空间占比大，存活时间长，所以不需要高频率进行垃圾回收，<br/>
通过这样区分，就可以使垃圾回收更高效

#### 新生代空间的垃圾回收
新生代空间一分为二，分别是`from`和`to`区域。对象会率先在活动区`from`中分配空间<br/>
当垃圾回收开始时，在`from`区标记仍然存活的对象并复制到空闲区`to`，把非存活的对象释放 <br/>
复制结束后，两个区域的对象进行交换，这样to区域保留的就是每次垃圾回收后仍然存活的对象 <br/>

#### 老生代空间的垃圾回收
因为老生代空间比较大，存活的对象比较多，所以不能使用新生代的回收算法<br/>
更适合用标记清除算法

### 并行回收
基于JavaScript是单线程语言，垃圾回收时会对js脚本进行阻塞，所以回收过程中会造成一种“全停顿”现象<br/>
v8引擎对此增加了并行回收机制，意味着会开启辅助线程同时执行垃圾回收，缩短全停顿的时间<br/>
此机制主要针对新生代空间

### 增量标记
虽然开启辅助线程缩短垃圾回收的时间，但是依然存在全停顿的现象，所以并行回收不使用于老生代空间<br/>
针对老生代空间，v8使用了增量标记的方法。

#### 什么是增量标记
每执行一段GC，交出执行权还给主线程执行JavaScript，接着又执行GC。
为了防止上一段JavaScript的执行恢复对被标记的对象的引用，所以v8提供了三色标记法解决这个问题<br/>
关于**三色标记法**的详细说法可以看这个 [三色标记法](https://juejin.cn/post/6981588276356317214#heading-15)

### 惰性清理
标记工作结束后，通过清除被标记的对象从而实现真正的释放缓存<br/>
惰性清理的机制是假如当前的内存足够让我们快速的执行代码那么清除动作是会被延迟的，优先让js代码执行<br/>
这样可以使用户和浏览器交互的过程更加流畅

### 并发回收机制
并发回收不会阻塞主线程，主线程执行js代码，辅助线程执行GC，当js执行过程引用对象关系改变时，辅助线程的标记也要随着改变，
这一点通过读写锁的机制来实现


