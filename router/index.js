const routes = [{
        path: '/map',
        component: () =>
            import ('../src/components/Map'),
    },
    {
        path: '/ol',
        component: () =>
            import ('../src/components/ol/Index'),
        children: [
            {
                // 当 /user/:id/profile 匹配成功
                // UserProfile 将被渲染到 User 的 <router-view> 内部
                path: 'channel',
                component: () =>
                    import ('../src/components/ol/style/channel/Channel'),
            },
            {
                // 当 /user/:id/profile 匹配成功
                // UserProfile 将被渲染到 User 的 <router-view> 内部
                path: 'dam',
                component: () =>
                    import ('../src/components/ol/style/dam/Dam'),
            },
            {
                // 当 /user/:id/profile 匹配成功
                // UserProfile 将被渲染到 User 的 <router-view> 内部
                path: 'canvas',
                component: () =>
                    import ('../src/components/ol/style/Canvas'),
            },
        ],
    },
    /* {
        path: '/cesium',
        component: () =>
            import ('../src/components/cesium/Index'),
        children: [
            {
                // 当 /user/:id/profile 匹配成功
                // UserProfile 将被渲染到 User 的 <router-view> 内部
                path: '/particle',
                component: () =>
                import ('../src/components/cesium/ParticleSystem'),
            },
        ],
          
    }, */
    {
        path: '/',
        redirect: '/map' //系统默认页
    }
]


export default routes;