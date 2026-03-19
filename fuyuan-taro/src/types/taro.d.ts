import Taro from '@tarojs/taro'

// 扩展 Taro 类型
declare module '@tarojs/taro' {
  namespace Taro {
    // 请求配置
    interface RequestOption {
      url: string
      data?: any
      method?: 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'
      header?: any
      dataType?: string
      responseType?: string
    }

    // 请求返回
    interface RequestSuccessCallbackResult {
      data: any
      statusCode: number
      header: any
    }

    // 上传配置
    interface UploadFileOption {
      url: string
      filePath: string
      name: string
      formData?: any
      header?: any
      onProgressUpdate?: (res: any) => void
    }

    // 获取系统信息
    function getSystemInfoSync(): any
    function getSetting(): Promise<any>
    function openSetting(): Promise<any>
    function saveImageToPhotosAlbum(option: any): Promise<any>
    function getFileInfo(option: any): Promise<any>
    function previewImage(option: any): void

    // Promise 请求
    interface TaroStatic {
      request(option: RequestOption): Promise<RequestSuccessCallbackResult>
      uploadFile(option: UploadFileOption): Promise<any>
    }
  }
}
