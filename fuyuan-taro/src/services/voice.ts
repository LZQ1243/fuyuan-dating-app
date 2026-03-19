import request from './request'
import { uploadFile } from './upload'

/**
 * 上传语音文件
 */
export const uploadVoice = async (options: {
  filePath: string
  duration: number
}) => {
  return uploadFile({
    filePath: options.filePath,
    name: 'audio',
    formData: {
      duration: options.duration.toString()
    }
  })
}

/**
 * 删除语音文件
 */
export const deleteVoice = async (id: string) => {
  return request({
    url: `/voice/${id}`,
    method: 'DELETE'
  })
}

/**
 * 获取语音信息
 */
export const getVoiceInfo = async (id: string) => {
  return request({
    url: `/voice/${id}`,
    method: 'GET'
  })
}
