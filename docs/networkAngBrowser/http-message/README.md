# HTTP报文

- **请求报文** 
    - **请求行** 请求方法 URL字段 HTTP协议版本 例如 `Get /api/userInfo HTTP/1.1`
    - **请求头** 
        - 涉及数据类型
            - `Accept` 浏览器可接受的MIME类型，例如请求css文件添加`text/css`，请求json数据的接口设置`application/json`
            - `Accept-encoding` 浏览器能够解码的编码方式，例如使用了压缩后的代码gzip，那么要给该请求头添加`gzip`
        - 涉及跨域
            - `Origin` 告知服务器发起请求的url
            - `access-control-request-method` 浏览器发起预检请求时，该请求头的值是要跨域访问的请求方法
            - `Access-Control-Request-Headers` 需要额外发送的请求头，因为CORS跨域对请求头设置的限制
        - 涉及用户信息验证
            - `Cookie` 验证发起请求的用户信息，如果有服务器有设置，不做其它处理的话，Cookie会自动携带到请求头中
        - 涉及缓存
            - `if-none-match` 如果请求的资源中有返回`Etag`响应头 下一次发起请求会自动携带该请求头用于判断缓存是否有效
            - `if-modified-since` 如果请求的资源中有返回`last-modified`响应头 下一次发起请求会自动携带该请求头用于判断缓存是否有效
    - **请求数据** 如果是GET请求，不会有请求数据，或者会把请求数据放在请求行中

- **响应报文**
    - **响应行** 由HTTP协议版本 状态码组成
    - **响应头**
        - 涉及数据类型
            - `content-type` 响应类型
            - `content-length` 响应内容长度
        - 涉及跨域
            - `access-control-allow-credentials` 是否运行请求携带cookie
            - `access-control-allow-origin` 允许发起跨域请求的url
            - `Access-Control-Request-Headers` 允许额外设置的请求头
            - `Access-Control-Request-Method` 允许跨域的请求方法
        - 涉及用户信息验证
            - `Set-cookie` 设置后，默认情况下浏览器下次发起请求就会在响应头中自动携带cookie
        - 涉及缓存
            - `expires` 资源过期时间
            - `cache-control` 控制缓存的方式
            - `Last-Modified` 最后一次在服务器修改的时间
            - `Etag` 根据服务器资源内容生成的hash值
        - 涉及安全
            - `content-security-policy` 设置可靠的资源（外部脚本、样式表、图片等等）加载，防止xss攻击

