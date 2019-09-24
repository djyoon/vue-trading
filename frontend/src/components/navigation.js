
export default {
  data: function() {
    return {
        activeUrl: '/trade',
        items: []
    }
  },
  computed: {
    isLogin(){
      return this.$store.state.isLogin
    },
      loginId(){
        return this.$store.state.loginId
      }
  },
  mounted: function() {

      this.$http.post('http://localhost:8081/user/logincheck',{ token : this.$store.state.token },
          { headers: { 'Content-Type': 'application/json' }})
          .then(response => {
              if(response.data.result == 1){

              } else {
                  this.$store.commit('logout')
                  this.$router.push('/')
              }
          }).catch(()=>{
          this.$store.commit('logout')
          this.$router.push('/')
      })

  },
  methods: {
    goPage : function(url){
        this.$http.post('http://localhost:8081/user/logincheck',{ token : this.$store.state.token },
            { headers: { 'Content-Type': 'application/json' }})
            .then(response => {
                if(response.data.result == 1){
                    this.activeUrl = url
                    this.$router.push(url)
                } else {
                    this.$store.commit('logout')
                    this.$router.push('/')
                }
            })
    },
      // 수익률 확인
      reqYield : function() {
          this.$http.get('http://localhost:8081/user/yield/'+this.$store.state.loginId,
              { headers: { 'Content-Type': 'application/json' }})
              .then(response => {
                  if(response.data.result == 0){
                      this.items = []
                      let _yield = 0
                      let quantity = response.data.quantity
                      if(response.data.avgPrice !=0){
                          _yield = ((response.data.marketPrice/response.data.avgPrice)-1)*100
                          _yield < 0 ? Math.floor(Math.abs(_yield) * 100) * -1 / 100 : _yield.toFixed(2)
                      } else {
                          _yield = 0
                      }
                      this.items.push({
                          coin: 'BTC',
                          구매KRW: response.data.avgPrice,
                          현재시장가: response.data.marketPrice,
                          수익률: _yield +'%'
                      })
                  } else {

                  }
              })
      },
    logout() {
      this.$store.commit('logout')
      this.$router.push('/')
    }
  }
}
