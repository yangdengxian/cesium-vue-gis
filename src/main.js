import Vue from 'vue'
import VueRouter from 'vue-router';
import routes from '../router';
import App from './App.vue'
import 'ant-design-vue/dist/antd.css';
import { Button, Layout } from 'ant-design-vue';



Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(Button)
Vue.use(Layout)

//引入cesium相关文件
var cesium = require('cesium/Cesium');
var widgets= require('cesium/Widgets/widgets.css');
 
Vue.prototype.cesium = cesium
Vue.prototype.widgets = widgets

const router = new VueRouter({
    routes
})

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')