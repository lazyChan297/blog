module.exports = {
    title: '297 blog',
    description: '297 blog',
    head: [ // 注入到当前页面的 HTML <head> 中的标签
      ['link', { rel: 'icon', href: '/logo.jpg' }], // 增加一个自定义的 favicon(网页标签的图标)
    ],
    // 这是部署到github相关的配置
    base: '', 
    markdown: {
      lineNumbers: true // 代码块显示行号
    },
    themeConfig: {
      pathUrl: '',
      // 导航栏配置
      nav:[ ],
      // 侧边栏配置
      sidebar: [
        {
            title: 'javascript', 
            collapsable: true, 
            children: [
                "/basic/call&apply&bind/",
                "/basic/js-prototype/",
                "/basic/js-curry/",
                "/basic/js-throttle&debounce/",
                "/basic/js-clone/",
                "/basic/js-promise/",
                "/basic/js-flat&unique/",
                "/basic/js-designMode/"
                ]
        },
        {
          title: 'vue源码学习',
          collapsable: false,
          children: [
            "/analysis/vue-lifecycle/"
          ]
        }
      ],
      sidebarDepth: 6, // 侧边栏显示2级
    }
  };
  