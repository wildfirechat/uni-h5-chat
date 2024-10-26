import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
    // 相当于 vue.congif.js 里面的 pubicPath，可配置为 cdn 地址，将资源文件放到 cdn，能大幅提升页面加载速度
    // base: 'https://static.wildfirechat.cn/h5',
    base: '/',
    plugins: [
        uni(),
    ],
})