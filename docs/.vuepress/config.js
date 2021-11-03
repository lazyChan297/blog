module.exports = {
    title: '297 blog',
    description: '297 blog',
    head: [ // 注入到当前页面的 HTML <head> 中的标签
      ['link', { rel: 'icon', href: '/logo.jpg' }], // 增加一个自定义的 favicon(网页标签的图标)
      ['script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.slim.min.js' }],
      ['script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.2/jquery.fancybox.min.js' }],
      ['link', { rel: 'stylesheet', type: 'text/css', href: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.2/jquery.fancybox.min.css' }]

    ],
    port: '8099',
    // 这是部署到github相关的配置
    base: '', 
    markdown: {
      lineNumbers: false // 代码块显示行号
    },
    plugins: [
      ['vuepress-plugin-markmap']
    ],
    themeConfig: {
      pathUrl: '',
      // 导航栏配置
      nav:[ ],
      // 侧边栏配置
      sidebar: [
        
        {
            title: 'JavaScript', 
            collapsable: true, 
            children: [
                "/basic/js-this/",
                "/basic/js-new/",
                "/basic/call&apply&bind/",
                "/basic/js-prototype/",
                "/basic/Array/",
                "/basic/RegExp/",
                "/basic/js-curry/",
                "/basic/js-storage/",
                "/basic/js-throttle&debounce/",
                "/basic/js-clone/",
                "/basic/js-designMode/",
                "/basic/js-implicit/",
                "/basic/es6-set&map&weakSet&weakMap/",
                "/basic/js-scope/"
                ]
        },
        {
          title: '异步编程',
          collapsable: true,
          children: [
            "/async/asyncawait/",
            "/async/js-promise/",
            "/async/generator/"
          ]
        },
        {
          title: '设计模式',
          collapsable: true,
          children: [
            "/DesignPatterns/EventEmitter/"
          ]
        },
        {
          title: 'vue源码学习',
          collapsable: true,
          children: [
            "/analysis/vue2-reactive/",
            "/analysis/vue3-reactive/",
            "/analysis/vue-lifecycle/",
            "/analysis/vue-nexttick/",
            "/analysis/vue-keepalive/",
            "/analysis/vue-diff/",
            "/analysis/vue-computed/",
            "/analysis/vue-set/",
            "/analysis/vue2-array-reactive/"
          ]
        },
        {
          title: 'React',
          collapsable: true,
          children: [
            "/react/redux/"
          ]
        },
        {
          title: 'React-native',
          collapsable: true,
          children: [
            "/react-native/rn-mfe/",
            "/react-native/rn-communication/",
            "/react-native/rn-frameDrop/",
            "/react-native/rn-preload/"
          ]
        },
        {
          title: 'node',
          collapsable: true,
          children: [
            "/node/version/"
          ]
        },
        {
          title: '网络与浏览器',
          collapsable: true,
          children: [
            '/networkAngBrowser/http-network/',
            '/networkAngBrowser/HTTP/',
            '/networkAngBrowser/https/',
            '/networkAngBrowser/http-tcp/',
            '/networkAngBrowser/http-dns/',
            '/networkAngBrowser/browserCaching/',
            '/networkAngBrowser/garbageCollection/',
            '/networkAngBrowser/MemoryLeak/',
            '/networkAngBrowser/safety/',
            '/networkAngBrowser/cross-domain/',
            '/networkAngBrowser/http-message/'
          ]
        },
        {
          title: '工程',
          children: true,
          children: [
            '/engineering/modules/',
            '/engineering/babel/',
            '/engineering/webpack/',
            '/engineering/RouterLazyLoading/'
          ]
        },
        
        {
          title: 'CSS',
          collapsable: true,
          children: [
            "/css/Flex/",
            "/css/Grid/",
            "/css/CSS3Animation/",
            "/css/css-basics/"
          ]
        },
        {
          title:'网络',
          collapsable: true,
          children: [
            "/Network/OSI&TCP/",
            "/Network/TCP&UDP/"
          ]
        },
        {
          title: '数据结构与算法',
          collapsable: true,
          children: [
            "/algorithm/sorting/",
            "/algorithm/binaryTree/",
            "/algorithm/linkedList/"
          ]
        }
      ],
      sidebarDepth: 6, // 侧边栏显示2级
    }
  };
  