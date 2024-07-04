import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
    // 可配置为 cdn 地址，将资源文件放到 cdn，能大幅提升页面加载速度
    //base: 'https://static.wildfirechat.cn/',
    base: '/',
    plugins: [
        uni(),
    ],
})