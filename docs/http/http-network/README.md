# 浏览器从输入URL到页面展示过程


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

1. 根据HTML解析DOM数
2. 根据CSS生成CSSOM树
3. 结合DOM和CSSOM，生成render tree
4. 根据render tree计算每一个节点的大小和位置
5. 根据计算好的位置和大小绘制节点

