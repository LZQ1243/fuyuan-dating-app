declare module 'react' {
  export * from 'react'
}

declare module 'react-dom' {
  export * from 'react-dom'
}

declare module 'react/jsx-runtime' {
  export const Fragment: any
  export const jsx: any
  export const jsxs: any
}

declare module 'react/jsx-dev-runtime' {
  export const Fragment: any
  export const jsxDEV: any
  export const jsxsDEV: any
}
