import Vue from 'vue'
import VueApexCharts from 'vue-apexcharts'
Vue.use(VueApexCharts)

Vue.component('apexchart', VueApexCharts)

let reqMethod = null
let reqChart = null

export default {
    data: function() {
        return {
            fields: [
                {key:'price', label:'' },{ key : 'quantity', label : ''}
            ],
            buyList : [],
            sellList : [],

            marketPrice : 0,

            buyPrice : 0,
            sellPrice : 0,

            buyQuantity : 0,
            sellQuantity : 0,

            krw : 0,
            btc : 0,

            series: [{
                data: []
            }],
            chartOptions: {
                chart :{
                    id : 'chart',
                    zoom: {
                        enabled: false,
                        type: 'x',
                        autoScaleYaxis: false,
                        zoomedArea: {
                            fill: {
                                color: '#90CAF9',
                                opacity: 0.4
                            },
                            stroke: {
                                color: '#0D47A1',
                                opacity: 0.4,
                                width: 1
                            }
                        }
                    }
                },
                title: {
                    text: 'BITMAX BTC CHART',
                    align: 'left'
                },
                xaxis: {
                    type : 'datetime',
                    labels :{
                        datetimeFormatter: {
                            year: 'yyyy',
                            month: "MMM 'yy",
                            day: 'dd MMM',
                            hour: 'HH:mm',
                        },
                    }
                },
                yaxis: {
                    tooltip: {
                        enabled: true
                    }
                }
            },

            isRise : false,

            buyCalling : false,
            sellCalling: false

        }
    },
    watch : {
        buyPrice : function(){
            if(this.buyPrice > this.krw || this.buyPrice.length > 20 || this.buyPrice < 0 ){
                this.buyPrice = 0
            }
            this.buyQuantity = 0
        },
        sellPrice : function(){
            if(this.sellPrice.length > 20 || this.sellPrice < 0){
                this.sellPrice = 0
            }
        },
        buyQuantity : function(){
            if(this.buyPrice * this.buyQuantity > this.krw){
                this.buyQuantity = 0
            }
        },
        /*sellQuantity : function(){
            if(this.sellQuantity > this.btc){
                this.sellQuantity = 0
            }
        }*/
    },
    computed : {
        buyCheck(){
            return  this.buyPrice == 0 || this.buyQuantity == 0  ? true : false
        },
        sellCheck(){
            return  this.sellPrice == 0 || this.sellQuantity == 0  ? true : false
        }
    },
    created: function() {
        reqMethod = setInterval(() => this.reqTradeInfo(),500)
        reqChart = setInterval(() =>   this.reqChartInfo(), 3000)
    },
    mounted: function() {
        this.reqChartInfo()
       // this.reqTradeInfo()
      //  setInterval(this.updateChart,1000)
    },
    beforeDestroy: function() {
        if(reqMethod){
            clearInterval(reqMethod)
        }
        if(reqChart){
            clearInterval(reqChart)
        }
    },
    methods: {
        reqChartInfo : function(){
            this.$http.get('http://localhost:8081/trade/chart',
                { headers: { 'Content-Type': 'application/json' }})
                .then((response) => {
                    this.series[0].data = []
                   response.data.forEach((chartData) =>{
                        this.series[0].data.push([[new Date(new Date(chartData._id).getTime())],
                                 [chartData.high,chartData.low,chartData.open,chartData.close]])
                   })
                }).catch((err) => {
                console.log(err)
            })
            ApexCharts.exec('chart', 'updateSeries', this.series, false);
        },
        reqTradeInfo : function(){
            this.$http.get('http://localhost:8081/trade',
                { headers: { 'Content-Type': 'application/json' }})
                .then((response) => {
                    this.buyList = []
                    this.sellList = []

                    if(response.data.marketPrice.length > 0){
                        this.marketPrice = response.data.marketPrice[0].price
                        if(response.data.marketPrice[1] && response.data.marketPrice[0].price >= response.data.marketPrice[1].price){
                            this.isRise = true;
                        } else {
                            this.isRise = false;
                        }
                    }
                    response.data.buyList.forEach(v =>{
                        this.buyList.push({price : v._id, quantity : v.quantity})
                    })
                    response.data.sellList.forEach(v =>{
                        this.sellList.push({price : v._id, quantity : v.quantity})
                    })

                    this.reqUserBalance();
                }).catch((err) => {

            })
        },
        reqUserBalance : function() {
            this.$http.get('http://localhost:8081/user/balance/'+this.$store.state.loginId,
                { headers: { 'Content-Type': 'application/json' }})
                .then((response) => {

                    this.krw = response.data.krw
                    this.btc = response.data.btc

                }).catch((err) => {

            })
        },
        reqBuy : function(){

            if(!this.buyCalling){
                this.buyCalling = true
                this.$http.post('http://localhost:8081/trade/buy',{price : this.buyPrice, quantity : this.buyQuantity,
                        type : 'buy', userid : this.$store.state.loginId },
                    { headers: { 'Content-Type': 'application/json' }})
                    .then((response) => {
                        this.buyCalling = false
                        if(response.data.result == 0){
                            this.$bvToast.toast(response.data.message, {
                                title: '비트맥스 매수주문',
                                variant : 'success',
                                solid: true
                            })
                        } else {
                            this.$bvToast.toast(response.data.message, {
                                title: '비트맥스 매수주문',
                                variant : 'danger',
                                solid: true
                            })
                        }
                    }).catch((err) => {

                })
            }
        },
        reqSell : function(){
            if(!this.sellCalling){
                this.sellCalling = true
                this.$http.post('http://localhost:8081/trade/sell',{price : this.sellPrice, quantity : this.sellQuantity,
                        type : 'sell', userid : this.$store.state.loginId },
                    { headers: { 'Content-Type': 'application/json' }})
                    .then((response) => {
                        this.sellCalling = false
                        if(response.data.result == 0){
                            this.$bvToast.toast(response.data.message, {
                                title: '비트맥스 매도주문',
                                variant : 'success',
                                solid: true
                            })
                        } else {
                            this.$bvToast.toast(response.data.message, {
                                title: '비트맥스 매도주문',
                                variant : 'danger',
                                solid: true
                            })
                        }
                    }).catch((err) => {

                })
            }
        }
    }
}
