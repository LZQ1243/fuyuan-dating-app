export default {
  pages: [
    'pages/index/index',
    'pages/match/index',
    'pages/chat/index',
    'pages/posts/index',
    'pages/mine/index',
    'pages/login/index',
    'pages/register/index',
    'pages/matchmaker/index',
    'pages/matchmaker/detail'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ff6b9d',
    navigationBarTitleText: '赴缘婚恋',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true
  },
  tabBar: {
    color: '#999',
    selectedColor: '#ff6b9d',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/match/index',
        text: '匹配',
        iconPath: 'assets/icons/match.png',
        selectedIconPath: 'assets/icons/match-active.png'
      },
      {
        pagePath: 'pages/chat/index',
        text: '消息',
        iconPath: 'assets/icons/message.png',
        selectedIconPath: 'assets/icons/message-active.png'
      },
      {
        pagePath: 'pages/posts/index',
        text: '动态',
        iconPath: 'assets/icons/moments.png',
        selectedIconPath: 'assets/icons/moments-active.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png'
      }
    ]
  }
}
