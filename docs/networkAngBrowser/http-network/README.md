# 浏览器渲染原理


## 1.解析输入的URL地址

http://www.72lsy.vip?query=text

URL中有特殊字符或者文字需要进行编码

`encodeURIComponent` 和 `encodeURI` 的使用场景

假如需要对某个URL片段的`,/?:@&=+$#`转义，可以对这部分使用`encodeURIComponent`

不需要则可以使用``encodeURI``

example

```javascript
let url = 'http://www.72lsy.vip?query=携带了中文&num=1+'

// encodeURI只对中文处理，忽略了,/?:@&=+$#
encodeURI(url) 
// http://www.72lsy.vip?query=%E6%90%BA%E5%B8%A6%E4%BA%86%E4%B8%AD%E6%96%87&num=1+

// encodeURIComponent对,/?:@&=+$#进行转义
encodeURIComponent(url) // http%3A%2F%2Fwww.72lsy.vip%3Fquery%3D%E6%90%BA%E5%B8%A6%E4%BA%86%E4%B8%AD%E6%96%87%26num%3D1%2B
```

## 2.DNS解析

被域名转换为IP地址

按照以下的顺序查询，如果在某一步解析成功则不会再往下

浏览器缓存 => 操作系统缓存 => 路由缓存 => ISP(_可以理解为三大运营商_）的DNS 服务器 => 根服务器

得到请求服务器的IP地址，并存入本地DNS缓存

## 3. 向请求服务器发起请求，三次握手

第一次，客户端向服务器发起握手，告诉服务器申请发起请求

第二次，服务器向客户端发起握手，告诉客户端可以发起请求

第三次，客户端向服务器发起握手，告诉服务器我已知晓你同意发起，我即将发起请求

三次握手的意义在于建立可靠的链接

## 4. 客户端发送请求报文

## 5. 服务器响应

## 6. 关闭TCP链接

获取到服务端响应的数据后，断开TCP链接，也就是四次挥手

## 7. 浏览器渲染

1. 根据HTML文档解析DOM树
2. 根据CSS生成CSSOM树
3. 结合DOM和CSSOM，生成render tree
4. 根据render tree进行回流，得到节点的几何信息（位置和大小）
5. 根据回流得到的几何信息进行重绘
6. 调用GPU绘制，展示在页面上

### 回流和重绘的触发
- 回流
    - 页面第一次渲染
    - 删除或添加dom元素
    - 元素位置发生变化
    - 元素尺寸发生变化（margin，padding，border，width，height）
    - 元素的内容发生变化
    - 浏览器窗口发送变化
    - 获取元素的offsetTop,offsetLeft,offsetWidth,offsetHeight,scrollTop,scrollLeft,scrollRight,scrollWidth,scrollHeight,
      clientTop,clientLeft,clientWidth,clientHeight;因为这些元素都需要进行实时的计算
- 重绘
    - 触发回流就因为会触发重绘
    - color，文本方向，阴影的修改

- 尽可能减少回流触发的方式
1. 避免使用table布局
2. 样式尽量使用class管理，避免直接操作dom元素 例如不要这样：el.style.width = 100px
3. css文件的层级不要太多，尽量扁平化

## 一些优化方式
script标签尽量放在body底部，因为浏览器在解析到script标签的时候会暂停构建dom
如果加载的文件没有任何的依赖，可以在script标签加async="async" 表示异步加载
给script标签加defer属性，表示加载该文件不会阻塞dom的渲染，在html文档解析完毕，DOMContentLoaded前顺序执行


