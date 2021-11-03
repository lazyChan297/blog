# 跨域
由于浏览器同源策略限制，当前客户端向不是它自身服务器发起的通信称之为跨域

## 同源策略
`协议` `域名` `端口号`，只要三者其中之一不同则称为跨域。<br/>

浏览器同源策略限制的目的是为了提高安全性，
- 假如客户端被csrf攻击得到客户端用户的cookie，或者cookie是明文传输的，没有限制那么攻击者就可以随意冒充用户向服务器发起请求，但并不意味着同源策略就完美的杜绝了该攻击，只是增加了攻击成本
- 假如使用iframe标签嵌套了客户端域名，那么可以就可以通过`window.frames[frameName]`获取客户端域名下的所有dom节点

## 解决跨域的方式

### jsonp
基于script标签不会有同源策略限制的原理实现的，请求到非同源的js文件执行，所以jsonp被限制只能使用get请求。

### cors
跨域资源共享，需要服务器设置支持才能允许跨域。浏览器发起的请求区分为简单请求和非简单请求，对这两种类型也会作出不同的处理
#### 简单请求
- 请求方法是`get` `post` `head`其中一种，
- http请求头不能超过`accept` `Accept-Language` `Content-Language` `Last-Event-ID` `Content-Type`(只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain)

浏览器会直接发出简单请求，会在请求头中添加`Origin`为当前发起请求的url，服务器接收到请求后判断该`Origin`是否在许可范围内，如果不在许可范围内，<br/>
服务器还是会返回一个正常的http回应，所以是不能通过状态码判断是否成功的。</br>
返回的响应头还会携带`Access-Control-Allow-Origin`，如果在许可范围内，该字段里的值就会包含刚刚发起请求的url或者是`*`，表示不限制访问。<br/>

此外，还有几个字段需要注意的，
- Access-Control-Allow-Credentials
表示是否允许cookie发送，如果服务器设置了该值为true，那么js中也要对相应的属性`withCredentials`设置为true，双方都同意才可以发送cookie

- Access-Control-Expose-Headers
如果想要拿到`Cache-Control` `Content-language` `Content-type` `Expires` `Last-modified`以外的字段就需要通过该字段设置，
然后通过xhr的`getResponseHeader(HeaderName)`获取你想要的字段


#### 非简单请求
- 请求方式是`put` `delete`
- 请求头`Content-Type`的值是application/json

浏览器会先发起一个option方法的预检请求preflight，询问服务器是否当前url是否在许可名单中，以及可以使用哪种http方法和头字段，<br/>
浏览器发起预检
- `Origin` 
- `Access-Control-Request-Method`，表示url要发起的http方法
- `Access-Control-Request-Headers`需要额外发送的请求头
服务器收到预检请求
- 检查`Origin`，`Access-Control-Request-Method`，`Access-Control-Request-Headers`的内容，判断是否允许跨域
服务器作出回应
- 预检通过，浏览器发起正常的请求，返回`Origin`，`Access-Control-Request-Method`，`Access-Control-Request-Headers`允许的值
- 预检不通过，会触发一个错误被xhr对象的onerror捕获
<br/>
浏览器发起的预检通过后，就可以发起正常的网路请求

### nginx代理转发
实现原理是跨域问题只存在浏览器之中，服务器之间的通信是没有同源限制，所以客户端先向自己所在的服务器发起请求也就是代理服务器，接着代理服务器和数据服务器通信<br/>
这样浏览器就会以为是在同一个服务器中通信。<br/>

以我曾经写过的一个项目为例，（ps：本地开启了switchHosts，所以当我在浏览器中输入自己的域名`music.72lsy.vip`，实则是访问本地的nginx服务`localhost`）<br/>
localhost服务器部署vue项目，该项目请求的接口来源于qq音乐，但是由于跨域问题且无法修改对方的接口，所以选择使用nginx转发实现跨域<br/>

#### node服务
node服务，里面的接口定义了一个`/api/getPurlUrl`的接口地址，内部再使用axios请求qq音乐的接口
```JavaScript
app.post('/api/getPurlUrl', bodyParser.json(), function (req, res) {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
  axios.post(url, req.body, {
    headers: {
      referer: 'https://y.qq.com/',
      origin: 'https://y.qq.com',
      'Content-type': 'application/x-www-form-urlencoded'
    }
  }).then((response) => {
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})
```
#### 前端配置
在vue项目中调用再请求`http://music.72lsy.vip/music/api/getPurlUrl`这个接口，增加了music是因为nginx服务器上我部署了多个项目<br/>
```JavaScript
export function getSongsUrl(songs) {
    const url = 'http://music.72lsy.vip/music/api/getPurlUrl'
    return new Promise((resolve, reject) => {
        if (res.code === ERR_OK) {
            axios.post(url).then((res) => {
                if (res.code === ERR_OK) {
                    resolve(res.data)
                }
            })
        }
    })
}
```

#### nginx中配置代理
当请求`music.72lsy.vip`时，包含有`music`的请求就会转发到本地的`localhost:9000`
```conf
server {
    listen       80;
    server_name music.72lsy.vip;
    autoindex on;
    #charset koi8-r;
    root /vue-music-h5/dist;
    index  index.html;
    location /music/ {
    proxy_pass http://127.0.0.1:9000/;
    }
}

```

### 开发过程的跨域处理
以vue-cli提供的`proxyTable`为例，实际上是在本地开发时通过本地服务器代理到后端服务器接口，原理和nginx一致
```javascript
dev: {
    proxyTable: {
        'api': {
            target: '需要访问的跨域服务器',
            secure: true, // 如果跨域服务器是https
            changeOrigin: true, // 如果设置为true，发送请求的host会变成target
            pathReWrite: {
                "/api": "替换成你需要修改的url部分"
            }
        }
    }
}
```