/// <reference types="react" />

// Taro模块类型声明
declare module '@tarojs/components' {
  import { ComponentClass, ReactNode } from 'react'
  
  export const View: ComponentClass<any>
  export const Text: ComponentClass<any>
  export const Button: ComponentClass<any>
  export const Image: ComponentClass<any>
  export const Input: ComponentClass<any>
  export const Textarea: ComponentClass<any>
  export const Picker: ComponentClass<any>
  export const ScrollView: ComponentClass<any>
  export const Radio: ComponentClass<any>
  export const RadioGroup: ComponentClass<any>
  export const Switch: ComponentClass<any>
  export const Slider: ComponentClass<any>
  export const Swiper: ComponentClass<any>
  export const SwiperItem: ComponentClass<any>
  export const Canvas: ComponentClass<any>
  export const Video: ComponentClass<any>
  export const Audio: ComponentClass<any>
  export const WebView: ComponentClass<any>
  export const Map: ComponentClass<any>
  export const Navigator: ComponentClass<any>
  export const Ad: ComponentClass<any>
  export const Icon: ComponentClass<any>
  export const RichText: ComponentClass<any>
  export const Progress: ComponentClass<any>
  export const MovableView: ComponentClass<any>
  export const OpenData: ComponentClass<any>
  export const OfficialAccount: ComponentClass<any>
}

declare module '@tarojs/taro' {
  export const Taro: any
  export function chooseImage(options: any): Promise<any>
  export function chooseVideo(options: any): Promise<any>
  export function showToast(options: any): void
  export function hideToast(): void
  export function showLoading(options: any): void
  export function hideLoading(): void
  export function showModal(options: any): Promise<any>
  export function showActionSheet(options: any): Promise<any>
  export function navigateTo(options: any): void
  export function navigateBack(options?: any): void
  export function redirectTo(options: any): void
  export function switchTab(options: any): void
  export function reLaunch(options: any): void
  export function getStorageSync(key: string): any
  export function setStorageSync(key: string, data: any): void
  export function removeStorageSync(key: string): void
  export function clearStorageSync(): void
  export function getSystemInfo(options?: any): Promise<any>
  export function getSystemInfoSync(options?: any): any
  export function request(options: any): Promise<any>
  export function uploadFile(options: any): Promise<any>
  export function downloadFile(options: any): Promise<any>
  export function createInnerAudioContext(): any
  export function createSelectorQuery(): any
  export const env: any
  export const process: any
}

declare module '@tarojs/router' {
  export function useRouter(): any
  export function useDidShow(effect: any, deps?: any[]): void
  export function useDidHide(effect: any, deps?: any[]): void
  export function useReady(effect: any, deps?: any[]): void
}

declare module 'react' {
  export * from 'react'
  export const useState: <S>(initialState: S | (() => S)) => [S, React.Dispatch<React.SetStateAction<S>>]
  export const useEffect: (effect: React.EffectCallback, deps?: React.DependencyList) => void
  export const useMemo: <T>(factory: () => T, deps?: React.DependencyList) => T
  export const useCallback: <T extends (...args: any[]) => any>(callback: T, deps?: React.DependencyList) => T
  export const useRef: <T>(initialValue: T | null) => React.MutableRefObject<T>
  export const createContext: <T>(defaultValue: T) => React.Context<T>
  export const useContext: <T>(context: React.Context<T>) => T
}

declare module 'react/jsx-runtime' {
  export const Fragment: any
  export const jsx: any
  export const jsxs: any
}

declare module '@/services/user' {
  export const getUserInfo: () => Promise<any>
  export const updateProfile: (data: any) => Promise<any>
}
