import { defineConfig } from 'vitepress'
import githubLink from './github-link'
import sidebar from './sidebar'
console.log('sidebar: ', sidebar)

export default defineConfig({
    title: 'JavaScript版本特性',
    themeConfig: {
        socialLinks: [
          { icon: 'github', link: githubLink },
        ],
        outline: 'deep',
        sidebarMenuLabel: '菜单',
        outlineTitle: '导航',
        darkModeSwitchLabel: '夜间模式',
        sidebar,
    },
    locales: {
        root: {
            lang: 'zh-cn',
            label: '简体中文'
        },
    },
    markdown: {
        theme: 'github-dark-dimmed',
    }
})
