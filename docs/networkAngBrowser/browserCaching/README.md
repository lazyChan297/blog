# 浏览器缓存机制

## 缓存的位置和读取顺序
1. service worker
    (关于service worker的介绍可以看这个[service worker 是什么](https://zhuanlan.zhihu.com/p/115243059))
2. memory cache
3. dick cache
4. push cache

## 缓存机制

### 强缓存
实现的方式有两种，第一种通过expires和Last-Modified进行比较资源是否过期，这两个标识会携带在服务端的response头部中 <br/>
::: tip 字段说明
Expires: 服务端response携带的标识，表示该资源在服务端过期时间 <br/>
Last-Modified: 该资源在服务端最后一次修改的时间
:::
第二种通过设置Cache-Control字段里的值来实现
::: tip Cache-Control字段说明
- public 浏览器&客服端都可以缓存
- private 只有浏览器可以缓存
- max-age=300 缓存30秒后过期需要重新缓存
- s-maxage=300 与max-age一致，但只在代理服务器生效
- no-store 不缓存任何内容
- no-cache 使用Etag or Last-Modified判断
- max-stale=30 能够容忍的最大过期时间，表示浏览器愿意接收一个最多过期30秒的资源
- min-fresh=30 能够容忍的最小新鲜度，表示浏览器不愿意接受新鲜度小于30秒的资源
:::

### 协商缓存
当强缓存失效后，浏览器会携带一些字段向服务器发起请求，根据字段值来决定是否返回资源
::: tip 字段说明
- Etag: 通过对该资源内容计算的hash值（服务器返回）
- If-None-Match: 上一次向服务器发起请求返回的Etag的值
- Last-Modified: 该资源在服务器最后修改的时间
- If-Modified-Since: 上一次向服务器发起请求返回的Last-Modified的值
::: 

#### Etag和If-None-Match
当浏览器第一次向服务端请求资源时，如果response的相应头有Etag这个字段，<br/>
那么下一次浏览器发送请求时，会在request的请求头携带`If-None-Match`字段，值时上一次请求返回的`Etag` <br/>
服务端会对`If-None-Match`和`Etag`进行比较，如果一致告知浏览器资源没有发生改变，返回浏览器缓存内容<br/>
否则返回最新的资源

#### Last-Modified和If-Modified-Since
当浏览器第一次向服务端请求资源时，如果response的相应头有Last-Modified这个字段，<br/>
那么下一次浏览器发送请求时，会在request的请求头携带`If-Modified-Since`字段，值时上一次请求返回的`Last-Modified` <br/>
服务端会对`Last-Modified`和`If-Modified-Since`进行比较，如果一致告知浏览器资源没有发生改变，返回浏览器缓存内容<br/>
否则返回最新的资源

#### Etag和Last-Modified对比
- 在缓存精度上，Etag优于Last-Modified<br/>
  因为，如果本地打开了该资源虽然没有进行修改，但是Last-Modified值仍然会被影响，导致缓存失效，Last-Modified的计时是以秒为单位<br/>
  一种边界情况是当资源在一秒内被修改多次，那么Last-Modified无效
- 在性能上，Last-Modified的消耗小于Etag，因为Etag需要服务器通过算法计算资源内容有没有发生改变生成hash值
- 服务器校验优先级Etag>Last-Modified

### 两种缓存机制的优先级
强缓存优先级高于协商缓存，当浏览器向服务器请求资源时 <br/>
会先判断强缓存是否生效，如果生效直接读取缓存内容<br/>
否则，根据携带的标识（If-Modified-Since或者If-None-Match)向服务器发起请求判断缓存是否过期<br/>
如果没有，直接返回304，使用缓存的内容<br/>
如果有，返回200，返回最新的资源

### 实际应用场景
不经常修改的资源，例如第三方库，一些静态资源可以使用强缓存<br/>
经常修改的资源，可以使用`Cache-Control: no-cache`，结合需求给response配置标识 <br/>

## 参考内容
[深入理解浏览器的缓存机制](https://www.jianshu.com/p/54cc04190252)