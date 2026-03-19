import { Component } from 'react'
import { PropsWithChildren } from 'react'

export default class App extends Component<PropsWithChildren> {

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  render () {
    return this.props.children
  }
}
