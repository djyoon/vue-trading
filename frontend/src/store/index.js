import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import * as Cookies from 'js-cookie'

Vue.use(Vuex)

export default new Vuex.Store({
    state : {
        loginId : '',
        token : null,
        isLogin: false,
    },
    mutations: {
        login(state, {token, loginId}) {
            state.loginId = loginId
            state.token = token
            state.isLogin = true
        },
        logout(state) {
            state.token = null
            state.isLogin = false
        },
    },
    plugins: [
        createPersistedState({
            state: {
                getState: (key) => Cookies.getJSON(key),
                setState: (key, state) => Cookies.set(key, state, { expires: 5, secure: true })
            }
        })
    ]
})
