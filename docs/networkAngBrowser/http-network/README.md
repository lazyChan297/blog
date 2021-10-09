# 页面显示流程


**解析URL地址**
对URL中有特殊字符或者文字进行编码
- 使用`encodeURIComponent`对`,/?:@&=+$#`转义
- 使用`encodeURI`仅仅对中文处理
```javascript
let url = 'http://www.72lsy.vip?query=携带了中文&num=1+'
// encodeURI只对中文处理，忽略了,/?:@&=+$#
encodeURI(url) 
// http://www.72lsy.vip?query=%E6%90%BA%E5%B8%A6%E4%BA%86%E4%B8%AD%E6%96%87&num=1+
// encodeURIComponent对,/?:@&=+$#进行转义
encodeURIComponent(url) // http%3A%2F%2Fwww.72lsy.vip%3Fquery%3D%E6%90%BA%E5%B8%A6%E4%BA%86%E4%B8%AD%E6%96%87%26num%3D1%2B
```

**dns解析**
域名转换为IP地址，按照以下的顺序查询，
`浏览器缓存` => `操作系统缓存` => `路由缓存` => `ISP(运营商DNS 服务器)` => `根服务器`
如果在某一步解析成功则不会再往下，得到请求服务器的IP地址，并存入本地DNS缓存

**dns预解析**
将其他域名的资源提前解析，例如图片链接通常会使用一个专门的域名来管理，那么可以配置`<link rel="dns-prefetch" href="//pic.xxx.com">`<br/>
如果是https请求，需要额外配置`<meta http-equiv="x-dns-prefetch-control" content="on">`<br/>


**建立TCP链接**
三次握手，确认双方的收发能力，建立可靠的链接

**客户端发送请求报文**

**服务器响应**

**关闭TCP链接**
获取到服务端响应的数据后，断开TCP链接，也就是四次挥手

**浏览器渲染**
- 将HTML标记解析dom tree
- 将样式表生成CSSOM树
- 从dom tree根节点开始遍历，对每一个可见节点找到对应的样式规则合并，最终得到render tree
- `layout `从render tree根节点开始遍历，得到每个节点的几何信息（位置和大小）
- `paint` 从render tree根节点开始遍历，修改每个节点的外观属性但不修改几何信息
- 调用GPU process，将render tree最终修改结果展示在页面上

**渲染方向的优化**<br/>

**异步加载资源**script标签使用`async`或`defer`实现异步加载资源，使加载过程不阻塞页面的渲染，不过执行的过程仍然会阻塞<br/>

**优化样式表**样式表下载、解析是会造成页面渲染阻塞的，如果页面有骨架屏或者启动样式，可以将该部分的样式分割，先加载该资源，剩余的样式链接使用`preload`提升它的优先级下载但并不会阻塞页面渲染




