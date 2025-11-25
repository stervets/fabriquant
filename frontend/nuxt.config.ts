const isDevelopmentMode = process.env.NODE_ENV === 'development' || process.env.CUSTOM_ENV === 'test';
const config = (process.env.NODE_ENV === 'development' ? require('./config.development') : (
    process.env.CUSTOM_ENV === 'test' ? require('./config.test') : require('./config.production')
));

export default defineNuxtConfig({
    modules: [
        '@nuxtjs/tailwindcss',
        '@nuxtjs/color-mode',
        '@element-plus/nuxt'
    ],

    compatibilityDate: '2025-11-24',

    devtools: {enabled: isDevelopmentMode},
    sourcemap: isDevelopmentMode,

    build: {
        analyze: {
            open: false,
        }
    },

    typescript: {
        shim: false,
        tsConfig: './tsconfig.json'
    },

    elementPlus: {
        themes: ['dark']
    },

    srcDir: 'src/',

    // dir: {
    //     public: 'src/public'
    // },

    devServer: {
        host: '0.0.0.0',
        port: 7000
    },

    nitro: {
        routeRules: {
            '/**': {
                headers: {
                    'Cross-Origin-Opener-Policy': 'same-origin',
                    'Cross-Origin-Embedder-Policy': 'require-corp'
                }
            }
        }
    },

    vite: {
        server: {
            headers: {
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp'
            }
        }
    },

    tailwindcss: {
        exposeConfig: true,
        viewer: true,
    },

    runtimeConfig: {
        public: {
            ...config
        },
    },

    plugins: [
        {src: './plugins/event-bus.ts', mode: 'client'},
        {src: './plugins/dark-theme.ts', mode: 'client'},
    ],

    app: {
        head: {
            title: 'Fabriquant',
            meta: [
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no width=device-width, viewport-fit=cover"
                },
                {
                    name: "mobile-web-app-capable",
                    content: "yes"
                }
            ],

            link: [
                {rel: 'icon', type: 'image/png', href: 'img/FabriquantLogoColor.png'}
            ]
        },
    },

    ssr: false
})
