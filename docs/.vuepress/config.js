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
          title: '数据结构与算法',
          collapsable: false,
          children: [
            "/algorithm/binaryTree/",
            "/algorithm/linkedList/"
          ]
        },
        {
          title: 'React',
          collapsable: false,
          children: [
            "/react/redux/"
          ]
        },
        {
            title: 'javascript', 
            collapsable: true, 
            children: [
                "/basic/call&apply&bind/",
                "/basic/js-prototype/",
                "/basic/js-curry/",
                "/basic/js-storage/",
                "/basic/js-throttle&debounce/",
                "/basic/js-clone/",
                "/basic/js-flat&unique/",
                "/basic/js-designMode/",
                "/basic/js-new/",
                "/basic/js-implicit/",
                "/basic/js-this/",
                "/basic/es6-set&map&weakSet&weakMap/"
                ]
        },
        {
          title: '异步编程',
          collapsable: false,
          children: [
            "/async/asyncawait/",
            "/async/js-promise/",
            "/async/generator/"
          ]
        },
        {
          title: 'vue源码学习',
          collapsable: true,
          children: [
            "/analysis/vue-reactive/",
            "/analysis/vue-lifecycle/",
            "/analysis/vue-nexttick/",
            "/analysis/vue-keepalive/",
            "/analysis/vue-diff/",
            "/analysis/vue-computed/"
          ]
        },
        {
          title: '网络',
          collapsable: true,
          children: [
            '/http/http-network/',
            'http/https/'
          ]
        },
        '/engineering/modules/',
        '/engineering/babel/',
        '/engineering/webpack/',
        {
          title: 'css',
          collapsable: true,
          children: [
            "/css/css-basics/",
            "/css/css-layout/"
          ]
        }
      ],
      sidebarDepth: 6, // 侧边栏显示2级
    }
  };
  