export default {
    data: function() {
        return {
            loginId : '',
            loginPw : '',

            signId : '',
            signPw : '',
            signPw2 : ''
        }
    },
    computed : {

        loginCheck(){
            return  this.loginId.length > 0 && this.loginPw.length > 0  ? false : true
        },
        signCheck(){
            return  this.signId.length > 0 && this.signPw.length > 0 && this.signPw2.length > 0  ? false : true
        }
    },

    created: function() {
        this.$store.commit('logout')
    },
    mounted: function() {

    },
    beforeDestroy: function() {

    },
    methods: {
        reqLogin : function() {
            this.$http.post('http://localhost:8081/user/login',{ userid : this.loginId, userpw : this.loginPw},
                { headers: { 'Content-Type': 'application/json' }})
                .then((response) => {
                    if(response.data.result == 0){
                        this.$store.commit('login', { token : response.data.token, loginId : response.data.loginId })
                        this.$router.push('/trade')
                    } else {
                        this.$bvToast.toast(response.data.message, {
                            title: '비트맥스 로그인',
                            variant : 'danger',
                            solid: true
                        })
                    }

                })
                .catch(() => {

                })
        },
        reqSignup : function() {

            this.$http.post('http://localhost:8081/user/signup', { userid : this.signId, userpw : this.signPw },
                { headers: { 'Content-Type': 'application/json' }})
                .then((response) => {
                    if(response.data.result == 1){
                        this.$refs['signup-modal'].hide()
                        this.$bvToast.toast(response.data.message, {
                            title: '비트맥스 회원가입',
                            variant : 'success',
                            solid: true
                        })
                    } else {
                        this.$bvToast.toast(response.data.message, {
                            title: '비트맥스 회원가입',
                            variant : 'danger',
                            solid: true
                        })
                    }
                })
                .catch(() => {

                })
        },
    }
}
