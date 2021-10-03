# 安全防范

## 攻击方式

### xss跨站脚本攻击
通过植入恶意代码，使代码在浏览器或者服务器中执行，从而达到攻击的目的。

#### url中拼接恶意代码攻击
当js解析url并跳转时没有检查把恶意代码一并执行然后进行跳转攻击者网站，这样就可以获取用户的cookie。
#### 常见场景
- url中拼接js脚本
- 将脚本随着用户在输入框中的内容一并提交到数据库

#### 防范方法
1. 可以设置cookie的读取权限使cookie不会随着请求一起发送，从而达到不被通过cookie窃取到用户信息的目的
- http-only: 只允许http或https请求读取cookie、JS代码是无法读取cookie的，如果通过document.cookie读取，会显示http-only的cookie项被自动过滤掉
- secure-only: 只允许https请求读取
- host-only: 只允许主机域名与domain设置完成一致的网站才能访问该cookie

2. 对用户的编码进行防御，防止恶意代码通过input输入等方式提交到浏览器执行环境或服务器中
- 对`&` `<` `>` `"` `'` `/` 转义为实体字符，这样便可以把嵌套到标签的代码过滤
- 对于富文本输入可以引入`xss`包，会自动过滤

3. 设置csp白名单，禁止一切名单外的代码注入执行
- 在http头部设置Content-Security-Policy
- 在html的meta标签http-equiv为Content-Security-Policy
`<meta http-equiv="Content-Security-Policy" content="script-src 'self'; object-src 'none'; style-src cdn.example.org third-party.org; child-src https:">`


### CSRF跨站请求伪造
通过获取到用户信息后冒充用户，或者诱导用户在用户非自愿的情况下，向服务器发起非预期的请求

#### 常见场景
- 在图片资源中夹带恶意请求
例如在某论坛评论了一张图片，该图片url是恶意请求，这样一旦加载图片不管用户是否自愿都会发起请求
- 诱导用户点击

#### 防范方法
1. 设置cookie的SameSite属性，`Strict`表示任何情况下都不能作为第三方cookie使用，`Lax`表示通过其它网站跳转过来的时候可以使用cookie
2. 使用token代替cookie，因为token由客户端保存、提交、不会随着请求一起自动发送，只要保证token的安全就可以保证用户信息不被冒充使用

### 中间人攻击
在客户端与服务器通信过程中劫持，对客户端伪装成服务器，对服务器伪装成客户端。
因为使用http通信，所有内容都是明文传输的，使用https就可以很高效率的防止中间人攻击。[HTTP加密原理](/networkAngBrowser/https/)
