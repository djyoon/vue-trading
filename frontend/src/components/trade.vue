<template>
        <div style="display:inline;">
            <div style="float:left; display:inline; width: 33%">
                <b-table small striped fixed :items="sellList" style="color:blue;"></b-table>
                <h3 :class="[ isRise ? 'red' : 'blue' ]">
                    <b-badge>MARKET PRICE</b-badge>
                    {{ marketPrice | numFormat }}
                <span v-if="isRise">&uarr;</span> <span v-if="!isRise">&darr;</span>
                </h3>
                <b-table small striped fixed :fields="fields" :items="buyList" style="color:red;"></b-table>
            </div>
            <div style="float:left;width: 55%; margin-left: 5%">
                <div id="chart">
                    <apexchart type=candlestick height=350 :options="chartOptions" :series="series" />
                </div>
                <b-container class="bv-example-row">
                    <b-row>
                        <b-col><h1><b-badge>매수</b-badge></h1>Available KRW : {{ krw  | numFormat }} </b-col>
                        <b-col><h1><b-badge>매도</b-badge></h1>Available BTC : {{ btc }} </b-col>
                    </b-row>
                    <b-row>
                        <b-col>
                            <b-input-group prepend="금액" class="mt-2">
                                <b-form-input v-model="buyPrice" type="number"></b-form-input>
                            </b-input-group>
                            <b-input-group prepend="수량" class="mt-2">
                                <b-form-input v-model="buyQuantity" type="number" :value="buyQuantity"></b-form-input>
                            </b-input-group>
                            <div>
                                <b-form-input id="range-1" v-model="buyQuantity" type="range" min="0" :max="krw / buyPrice"></b-form-input>
                            </div>
                        </b-col>
                        <b-col>
                            <b-input-group prepend="금액" class="mt-2">
                                <b-form-input v-model="sellPrice" type="number"></b-form-input>
                            </b-input-group>
                            <b-input-group prepend="수량" class="mt-2">
                                <b-form-input v-model="sellQuantity" type="number" :value="sellQuantity"></b-form-input>
                            </b-input-group>
                            <div>
                                <b-form-input id="range-2" v-model="sellQuantity" type="range" min="0" :max="btc"></b-form-input>
                            </div>
                        </b-col>
                    </b-row>
                    <b-row style="text-align: center;">
                        <b-col><b-button v-if="!buyCalling" id="button-1" @click="reqBuy" variant="danger" :disabled="buyCheck">BUY</b-button><b-spinner v-if="buyCalling"></b-spinner></b-col>
                        <b-col><b-button v-if="!sellCalling" id="button-2" @click="reqSell" variant="outline-primary" :disabled="sellCheck">SELL</b-button><b-spinner v-if="sellCalling"></b-spinner></b-col>
                    </b-row>
                </b-container>
            </div>
        </div>
</template>

<script src="./trade.js"></script>
<style type="text/css">
    .red {
     color:#dc4646
    }
    .blue {
        color:#538fff
    }

    #range-1, #range-2 {
        width: 100%;
    }
    #button-1, #button-2 {
        width: 100%;
    }

    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type=number] {
        -moz-appearance:textfield;
    }
</style>


