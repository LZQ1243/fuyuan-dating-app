import { defineApp } from '@tarojs/taro'
import './app.scss'

function App(props: any) {
  if (process.env.NODE_ENV === 'development') {
    require('taro-ui/dist/style/index.scss')
  }
  return props.children
}

export default defineApp(App)
