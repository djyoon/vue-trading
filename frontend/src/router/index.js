import Vue from 'vue'
import store from '../store'
import VueRouter from 'vue-router'
import Trade from '../components/trade.vue'
import Landing from '../components/landing.vue'
import Rank from '../components/rank.vue'

Vue.use(VueRouter)

const router = new VueRouter({
    mode: 'history',

    routes: [
        { path: '/', component: Landing },
        { path: '/trade', component: Trade },
        { path: '/trade/rank', component: Rank }
    ],
    // 페이지 전환시 화면 맨위로 스크롤 이동
    scrollBehavior () {
        return { x: 0, y: 0 }
    }
})

export default router
