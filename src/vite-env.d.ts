/// <reference types="vite/client" />

declare module '*.scss?url' {
  const src: string
  export default src
}
