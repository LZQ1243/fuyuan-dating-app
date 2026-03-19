import Taro from '@tarojs/taro'
import config from '@/config'

interface UploadOptions {
  filePath: string
  name?: string
  formData?: any
  onProgress?: (progress: number) => void
}

/**
 * 图片压缩
 * @param filePath 图片路径
 * @param quality 压缩质量 (0-1)
 */
export const compressImage = async (
  filePath: string,
  quality: number = config.upload.compressQuality
): Promise<string> => {
  try {
    const result = await Taro.compressImage({
      src: filePath,
      quality: Math.floor(quality * 100)
    })
    return result.tempFilePath
  } catch (error) {
    console.error('图片压缩失败:', error)
    return filePath
  }
}

/**
 * 检查文件大小
 * @param filePath 文件路径
 */
export const checkFileSize = async (filePath: string): Promise<boolean> => {
  try {
    const fileInfo = await Taro.getFileInfo({
      filePath
    })
    return fileInfo.size <= config.maxFileSize
  } catch (error) {
    console.error('获取文件信息失败:', error)
    return false
  }
}

/**
 * 选择图片
 * @param count 最多选择数量
 */
export const chooseImage = async (
  count: number = config.upload.maxImageCount
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    Taro.chooseImage({
      count,
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

/**
 * 上传单个文件
 */
export const uploadFile = async (options: UploadOptions): Promise<any> => {
  const { filePath, name = 'file', formData = {}, onProgress } = options

  // 检查文件大小
  const sizeValid = await checkFileSize(filePath)
  if (!sizeValid) {
    throw new Error('文件大小超过限制')
  }

  // 压缩图片
  const compressedPath = await compressImage(filePath)

  return new Promise((resolve, reject) => {
    const uploadTask = Taro.uploadFile({
      url: `${config.apiBaseUrl}/upload`,
      filePath: compressedPath,
      name,
      formData: {
        ...formData,
        token: Taro.getStorageSync('token')
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0) {
              resolve(data)
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (error) {
            reject(new Error('数据解析失败'))
          }
        } else {
          reject(new Error(`上传失败: ${res.statusCode}`))
        }
      },
      fail: (error) => {
        console.error('上传失败:', error)
        reject(error)
      }
    })

    // 监听上传进度
    if (onProgress) {
      uploadTask.onProgressUpdate((res) => {
        const progress = res.progress
        onProgress(progress)
      })
    }
  })
}

/**
 * 上传多张图片
 */
export const uploadImages = async (
  files: string[],
  onProgress?: (index: number, progress: number) => void
): Promise<string[]> => {
  const results: string[] = []

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadFile({
        filePath: files[i],
        name: 'image',
        onProgress: (progress) => {
          onProgress?.(i, progress)
        }
      })

      if (result.data?.url) {
        results.push(result.data.url)
      }
    } catch (error) {
      console.error(`上传图片 ${i + 1} 失败:`, error)
    }
  }

  return results
}

/**
 * 上传头像
 */
export const uploadAvatar = async (filePath: string): Promise<string> => {
  const result = await uploadFile({
    filePath,
    name: 'avatar'
  })

  return result.data?.url || ''
}

/**
 * 上传聊天图片
 */
export const uploadChatImage = async (filePath: string): Promise<string> => {
  const result = await uploadFile({
    filePath,
    name: 'chat_image',
    formData: {
      type: 'chat'
    }
  })

  return result.data?.url || ''
}

/**
 * 上传动态图片
 */
export const uploadPostImages = async (
  files: string[],
  onProgress?: (index: number, progress: number) => void
): Promise<string[]> => {
  const results: string[] = []

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadFile({
        filePath: files[i],
        name: 'post_image',
        formData: {
          type: 'post',
          index: i
        },
        onProgress: (progress) => {
          onProgress?.(i, progress)
        }
      })

      if (result.data?.url) {
        results.push(result.data.url)
      }
    } catch (error) {
      console.error(`上传动态图片 ${i + 1} 失败:`, error)
    }
  }

  return results
}

/**
 * 上传认证图片
 */
export const uploadVerificationImages = async (
  type: 'id_card_front' | 'id_card_back' | 'disability_card',
  filePath: string
): Promise<string> => {
  const result = await uploadFile({
    filePath,
    name: 'verification_image',
    formData: {
      type,
      category: 'verification'
    }
  })

  return result.data?.url || ''
}

/**
 * 删除已上传的文件
 */
export const deleteFile = async (fileUrl: string): Promise<boolean> => {
  try {
    const response = await Taro.request({
      url: `${config.apiBaseUrl}/upload/delete`,
      method: 'DELETE',
      data: { url: fileUrl },
      header: {
        'Authorization': `Bearer ${Taro.getStorageSync('token')}`
      }
    })

    return response.data.code === 0
  } catch (error) {
    console.error('删除文件失败:', error)
    return false
  }
}

/**
 * 获取文件信息
 */
export const getFileInfo = async (filePath: string) => {
  return Taro.getFileInfo({ filePath })
}

/**
 * 预览图片
 */
export const previewImage = (urls: string[], current?: string) => {
  Taro.previewImage({
    urls,
    current: current || urls[0]
  })
}

/**
 * 保存图片到相册
 */
export const saveImageToPhotosAlbum = async (filePath: string): Promise<boolean> => {
  try {
    // 检查权限
    const { authSetting } = await Taro.getSetting()

    if (authSetting['scope.writePhotosAlbum'] === false) {
      // 引导用户开启权限
      const res = await Taro.showModal({
        title: '提示',
        content: '需要您授权保存图片到相册',
        confirmText: '去设置'
      })

      if (res.confirm) {
        await Taro.openSetting()
        return false
      }
      return false
    }

    // 保存图片
    await Taro.saveImageToPhotosAlbum({
      filePath
    })

    Taro.showToast({
      title: '保存成功',
      icon: 'success'
    })

    return true
  } catch (error) {
    console.error('保存图片失败:', error)

    if (error.errMsg.includes('auth')) {
      Taro.showModal({
        title: '提示',
        content: '需要您授权保存图片到相册',
        showCancel: false
      })
    }

    return false
  }
}

export default {
  uploadFile,
  uploadImages,
  uploadAvatar,
  uploadChatImage,
  uploadPostImages,
  uploadVerificationImages,
  deleteFile,
  chooseImage,
  compressImage,
  checkFileSize,
  previewImage,
  saveImageToPhotosAlbum
}
