# 安全防范

## 攻击方式


### XSS跨站脚本攻击
通过植入恶意代码，使代码在浏览器或者服务器中执行，从而达到攻击的目的<br/>
**url中拼接恶意代码**，解析url时没有检查把恶意代码一并解析并执行 <br/>
**用户输入中注入恶意代码**，将恶意代码脚本随着用户在输入框中的内容一并提交到数据库
#### 防范方法
**防止cookie被恶意代码盗取** 可以在服务端响应头的`Set-cookie`字段设置cookie的读取权限使cookie不会随着请求一起发送，从而达到不被通过cookie窃取到用户信息的目的
- http-only: 只允许http或https请求读取cookie、JS代码是无法读取cookie的，如果通过document.cookie读取，会显示http-only的cookie项被自动过滤掉
- secure-only: 只允许https请求读取
- host-only: 只允许主机域名与domain设置完全一致的网站才能访问该cookie

**对用户的编码进行防御**，防止恶意代码通过input输入等方式提交到浏览器执行环境或服务器中
- 对`&` `<` `>` `"` `'` `/` 转义为实体字符，这样便可以把嵌套到标签的代码过滤
- 对于富文本输入可以引入`xss`包，会自动过滤

**内容安全策略**，开发者明确告诉浏览器哪些资源是可以加载的设置csp白名单，禁止一切名单外的代码注入执行
- 在http响应头部设置Content-Security-Policy
    - `script-src: 'self'` 限制只允许加载本域的脚本
    - `style-src: url` 限制样式表允许加载的url
    - `child-src https:` 限制iframe标签必须使用https加载
- 在html的meta标签http-equiv为Content-Security-Policy
`<meta http-equiv="Content-Security-Policy" content="script-src 'self'; object-src 'none'; style-src cdn.example.org third-party.org; child-src https:">`


### CSRF跨站请求伪造
诱导用户或者在用户非自愿的情况下，利用Cookie默认会随着请求一起发送的规则，获取用户信息冒充用户，向服务器发起非预期的请求
- 在图片资源中夹带恶意请求，例如在某论坛评论了一张图片，该图片url是恶意请求，这样一旦加载图片不管用户是否自愿都会发起请求
- 诱导用户点击

**跨站**<br/>
顶级域名`.com`+二级域名`.72lsy`+协议相同，但是端口号不同时，称为跨站<br/>


#### 防范方法
**限制cookie的发送** 设置`Set-cookie`的SameSite属性，Chrome的SameSite默认值是Lax，而Safari的默认值是Strict
- `SameSite=Strict` 跨站点时，任何情况下cookie都不会发送
- `SameSite=Lax` 通过其它网站跳转过来的时候，只有`a标签链接`、`预加载链接`、`get`请求会发送cookie
- `SameSite=none` 无论是否跨站都会发送cookie
**使用token代替cookie** 因为token由客户端保存、提交、不会随着请求一起自动发送，只要保证token的安全就可以保证用户信息不被冒充使用

### 中间人攻击
**攻击原理**
- 对于非HTTPS请求，因为通信前没有进行服务器验证，通信数据没有加密，中间人可以直接劫持服务器和客户端的通信，直接抓取报文就可以获得明文信息、篡改信息
- 对于HTTPS请求，通过伪造的CA认证机构证书（例如用户不慎信任了代理服务器伪造的CA认证机构的证书），这时伪造的CA认证机构证书就会欺瞒客户端认为代理服务器是可信的，客户端就会使用代理服务器的公钥，对接下来通信中要对数据加密的密钥加密，代理服务器收到加密的密钥后就可以使用自己的私钥对加密后的密钥解密了。

#### 防范方法
HTTPS请求可以一定程度地防止中间人攻击，因为通信前会进行身份认证，通过权威CA认证机构的证书可以鉴别数字证书真实性，**防止中间人冒充身份**<br/>
其次通信过程中数据被加密且会对数据进行完整性检查，**防止数据被劫持篡改**<br/>
但是如果用户信任了中间人伪造的CA认证证书，那么依然可以被攻击。使用`charles`等抓包工具抓取https请求时就是事先在客户端信任了抓包工具的证书，从而监听数据。
[HTTPS加密原理详细](/networkAngBrowser/https/)

