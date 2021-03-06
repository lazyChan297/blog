# HTTP版本差异

## HTTP1.0
每次发起请求时都需要重新建立一次连接，即三次握手流程，服务器处理完请求后立即断开连接。<br/>
如果需要保持连接需要手动设置`Connection:keep-alive`字段

## HTTP1.1
- 将`Connection:keep-alive`设为标准，默认支持长连接，意味着在一个TCP连接中，可以传送多个HTTP请求和响应，减少了建立连接和关闭连接的消耗和延迟。
- 允许客户端不等待上一次请求的结果返回就可以发出下一个请求，但是服务器还是必须按照请求的先后依次响应
- **缓存方面** 增加了If-Match、If-None-Match、If-Unmodified-Since缓存头控制缓存策略
- **range** 支持请求服务器资源的某一部分，http状态码返回206
- **Host** 当ip地址设置成多个不同的站点时，为了区分站点引入了host请求头
- **请求方法** 增加了put、delete、options方法

## HTTP2.0

### 新特性
#### 二进制传输
HTTP1.X中报文是以纯文本的格式传输的，HTTP2改为使用二进制编码传输，这样解析起来更高效<br/>
将请求和响应分割成若干个二进制帧，将原本报文的headers变为 `HEADER`帧，请求数据变为`DATA`帧，每一帧的首部有一个steamId，<br/>
一个或多个帧组成一条数据流，
在HTTP2中一个链接可以承载任意数量的双向数据流，一个数据流(stream)由一个或多个帧组成，多个帧之间可以乱序发送，根据帧首部的streamId可以对消息重新组装

#### header压缩
在客户端和服务器两端建立“首部表”，首部表存储之前请求发送过的键值对，对于相同的数据不用每次请求和响应都发送，缓存在首部表中<br/>
例如之前的请求使首部表已经缓存了`method` `host` `accept` `user-agent`等头部字段，当下一次发起请求时只需要发送差异的部分，这样就可以减少冗余数据


#### 多路复用
因为有了二进制传输的基础，在一个tcp连接里客户端和服务器可以同时发送多个请求和响应而且不需要按照顺序一一等待，这样就可以避免HTTP队头阻塞。
这样同一个域名只需要占用一个TCP连接，一个连接可以并行发送多个请求和响应

#### server push
HTTP2改变了传统的“请求-应答”模式，服务器不再是完全被动地响应请求，也可以新建“流”主动向客户端发送消息。比如，在浏览器刚请求HTML的时候就提前把可能会用到的JS、CSS文件发给客户端，减少等待的延迟。但是服务器推送的资源必须经过客户端的确认才可以被接收

#### 安全性
HTTP2出于兼容的考虑仍然可以使用http明文传输数据，但是主流的浏览器等已经公开宣布只支持加密的HTTP2

### 存在的问题
1. 由于HTTP2“默认”使用加密数据，所以建立TLS连接时也会有一个握手的过程
2. 为了保证TCP数据传输的可靠性，当丢包的时候有触发`丢包重传`机制，这样TCP连接就会重新开始等待重传；然后HTTP1.X是建立多个tcp连接，所以只会影响其中一个tcp，当出现这种状况时1.x版本略优于2

## HTTP3
基于2的缺点，新增了一个基于UDP协议的QUIC，该协议不需要三次握手和挥手，启动时间更快<br/>
实现了类似TCP的流量控制、传输可靠性的功能<br/>
集成了TLS加密功能<br/>
多路复用，彻底解决TCP中队头阻塞的问题<br/>