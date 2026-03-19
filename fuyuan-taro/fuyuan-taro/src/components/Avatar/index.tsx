import { View, Image } from '@tarojs/components'
import React, { FC } from 'react'
import './avatar.scss'

interface AvatarProps {
  src?: string
  size?: 'small' | 'medium' | 'large'
  shape?: 'circle' | 'square'
  onClick?: () => void
}

const Avatar: FC<AvatarProps> = ({ src, size = 'medium', shape = 'circle', onClick }) => {
  const getSizeClass = () => `avatar-${size}`

  const getShapeClass = () => `avatar-${shape}`

  return (
    <View
      className={`avatar ${getSizeClass()} ${getShapeClass()}`}
      onClick={onClick}
    >
      {src ? (
        <Image src={src} mode="aspectFill" />
      ) : (
        <View className="avatar-placeholder">
          <Text>头像</Text>
        </View>
      )}
    </View>
  )
}

export default Avatar
