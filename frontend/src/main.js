import Vue from 'vue'
import App from './app.vue'
import router from './router'
import axios from 'axios'
import store from './store'
import BootstrapVue from 'bootstrap-vue'
import numeral from 'numeral';
import numFormat from 'vue-filter-number-format';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)


Vue.filter('numFormat', numFormat(numeral));

Vue.prototype.$http = axios
new Vue({
        el: '#app',
        render: h => h(App),
        router,
        store
})