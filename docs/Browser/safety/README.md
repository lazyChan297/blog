# 安全防范

## 攻击方式


### XSS跨站脚本攻击
通过植入恶意代码，使代码在浏览器或者服务器中执行，从而达到攻击的目的

#### 反射型XSS
攻击者将包含注入恶意代码的链接发送给用户，当用户点击该链接时，目标服务器不作任何处理把脚本**反射**到用户的浏览器，从而使浏览器执行恶意代码<br/>
常见于邮箱链、网页链接跳转

#### 存储型XSS
常见于网站的评论、私信功能，将恶意代码连同数据一并提交到数据库中。当用户请求数据时，服务器连同恶意代码一并返回，当用户解析到html执行时也会执行恶意代码<br/>

#### DOM-based型XSS
利用客户端的JavaScript可以插入html结构的特点，在`document.write()`，`innerHTML`，`window.location`，`a标签的href属性`注入恶意代码脚本，从而使攻击者的代码可以在浏览器中执行

#### XSS攻击防范方法
- 对于存储型XSS和反射型XSS
    - 服务端需要对提交的数据进行过滤，不保存恶意代码到数据库中
    - 客户端需要对拼接到html的代码进行转义，将`&，<，>，"，/，` 转义为实体字符，防止嵌套在script标签中的代码执行
- 对于DOM-based型XSS
    - 使用`.innerHTML`、`.outerHTML`、`document.write()` 时要特别小心，不要把不可信的数据作为 `HTML` 插到页面上，而应尽量使用 `.textContent`、`.setAttribute()`、`.innerText` 等
    - 使用`a标签`，`location.href=""`，要验证其内容，以javascript:开头的链接和其他的非法schema都要禁止
- 设置cookie的读写权限，使cookie不会被注入的恶意代码读取，从而达到不被通过cookie窃取到用户信息的目的
    - `HttpOnly`: 只允许http或https请求读取cookie、JS代码是无法读取cookie的，如果通过document.cookie读取，会显示http-only的cookie项被自动过滤掉
    - `secure`: 只允许https请求读取
    - `HostOnly`
        - `true`: 只有浏览器url与cookie的domain属性完全相等时才可以使用；
        - `false`: 浏览器url与cookie的domain属性的二级域名和顶级域名相等就可以使用；
- 使用内容安全策略，开发者明确告诉浏览器哪些资源是可以加载的设置csp白名单，禁止一切名单外的代码注入执行
    - 在http响应头部设置Content-Security-Policy
        - `script-src: 'self'` 限制只允许加载本域的脚本
        - `style-src: url` 限制样式表允许加载的url
        - `child-src https:` 限制iframe标签必须使用https加载
    - 在html的meta标签http-equiv为Content-Security-Policy
`<meta http-equiv="Content-Security-Policy" content="script-src 'self'; object-src 'none'; style-src cdn.example.org third-party.org; child-src https:">`

### CSRF跨站请求伪造
诱导用户或者在用户非自愿的情况下，利用Cookie默认会随着请求一起发送的特性，冒充用户向服务器发起非预期的请求
- 在图片资源中夹带恶意请求，例如在某论坛评论了一张图片，该图片url是恶意请求，这样一旦加载图片不管用户是否自愿都会发起请求
- 诱导用户点击

**跨站**<br/>
顶级域名`.com`+二级域名`.72lsy`+协议相同，但是端口号不同时，称为跨站<br/>

#### 防范方法
- **限制cookie的发送** 设置`Set-cookie`的SameSite属性，Chrome的SameSite默认值是Lax，而Safari的默认值是Strict
    - `SameSite=Strict` 跨站点时，任何情况下cookie都不会发送
    - `SameSite=Lax` 通过其它网站跳转过来的时候，只有`a标签链接`、`预加载链接`、`get`请求会发送cookie
    - `SameSite=none` 无论是否跨站都会发送cookie
- **使用token代替cookie** 因为token由客户端保存、提交、不会随着请求一起自动发送，只要保证token的安全就可以保证用户信息不被冒充使用

### 中间人攻击
**攻击原理**
- 对于非HTTPS请求，因为通信前没有进行服务器验证，通信数据没有加密，中间人可以直接劫持服务器和客户端的通信，直接抓取报文就可以获得明文信息、篡改信息
- 对于HTTPS请求，通过伪造的CA认证机构证书（例如用户不慎信任了代理服务器伪造的CA认证机构的证书），这时伪造的CA认证机构证书就会欺瞒客户端认为代理服务器是可信的，客户端就会使用代理服务器的公钥，对接下来通信中要对数据加密的密钥加密，代理服务器收到加密的密钥后就可以使用自己的私钥对加密后的密钥解密了。

#### 防范方法
HTTPS请求可以一定程度地防止中间人攻击，因为通信前会进行身份认证，通过权威CA认证机构的证书可以鉴别数字证书真实性，**防止中间人冒充身份**<br/>
其次通信过程中数据被加密且会对数据进行完整性检查，**防止数据被劫持篡改**<br/>
但是如果用户信任了中间人伪造的CA认证证书，那么依然可以被攻击。使用`charles`等抓包工具抓取https请求时就是事先在客户端信任了抓包工具的证书，从而监听数据。
[HTTPS加密原理详细](/networkAngBrowser/https/)

