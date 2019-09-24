const Fawn = require("fawn");

const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'),
    secret = 'djyoon'

const moment = require('moment-timezone');

const db = "mongodb://djyoon:test@cluster0-shard-00-00-eggsb.mongodb.net:27017,cluster0-shard-00-01-eggsb.mongodb.net:27017,cluster0-shard-00-02-eggsb.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority"

mongoose.Promise = global.Promise;
mongoose.connect(db, {
    keepAlive: 300000,
    connectTimeoutMS: 30000,
}, (err) => {
    if (err) {
        console.log(`===>  Error connecting to ${db}`);
        console.log(`Reason: ${err}`);
    } else {
        console.log(`===>  Succeeded in connecting to ${db}`);
    }
});
Fawn.init(db);


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// if exist transation before server crashed, rollback transaction(use fawn)
var roller = Fawn.Roller();
roller.roll()
    .then(function(){
        app.listen(8081);
    });


var User = require("./models/user");
var Trade = require("./models/trade");
var TradeHistory = require("./models/tradehistory");

// 1. 회원가입
app.post('/user/signup',(req, res) => {
    User.findOne({userid : req.body.userid}, (err,user) => {
        if(err){
            res.status(500).json({ result : 0, message : err})
        }
        if(user){
            res.json({ result : 0, message : 'EXIST ID'})
        } else {
            let user = new User();
            user.userid = req.body.userid
            user.userpw = req.body.userpw
            user.save(function(err){
                if(err){
                    console.log(err)
                    res.json( { result : 0 , message : err })
                } else {
                    console.log('success')
                    res.json({ result : '1', message : 'OK' })
                }
            })
        }
    })
});

//2. 로그인
app.post('/user/login',(req, res) => {
    User.findOne({userid : req.body.userid})
        .then(user => {
            if(user && req.body.userpw === user.userpw){
                let token = jwt.sign({ userid : req.body.userid }, secret, { expiresIn : '10m'})
                res.json({ result : 0, message : 'welcome', token : token, loginId : user.userid, avgPrice : user.avgPrice })
            } else {
                res.json({ result : 1, message : 'invalid id or password'})
            }
        })
        .then().catch(err => {
            res.json(err)
    })
})

//3. 잔고확인
app.get('/user/balance/:id',(req, res) => {
    User.findOne({userid : req.params.id})
        .then(user => {
            if(user){
                if(user.btc == null){
                    user.btc = 0
                }
                res.json({ result : 0, krw : user.krw, btc : user.btc })
            } else {
                res.json({ result : 1, message : 'invalid id'})
            }
        })
        .then().catch(err => {
        res.json(err)
    })
})

//3-2 수익률확인
app.get('/user/yield/:id',(req, res) => {
    User.findOne({userid : req.params.id})
        .then(user => {
            if(user){
                TradeHistory.findOne().sort({date: 'desc'}).then(marketPrice =>{
                    res.json({ result : 0, quantity : user.btc, avgPrice : user.avgPrice, marketPrice : marketPrice.price  })
                })
            } else {
                res.json({ result : 1, message : 'invalid id'})
            }
        })
        .then().catch(err => {
        res.json(err)
    })
})

//4. 토큰체크
app.post('/user/logincheck',(req, res) => {
    try{
        let token = req.body.token
        let isValid = jwt.verify(token, secret);
        if(isValid){
            res.json({ result : 1 })
        } else {
            res.json({ result : 0})
        }
    } catch(err) {
        res.json({ result : 0})
    }
})

//5. 호가창 가져오기
app.get('/trade',(req, res) => {
    let result = {
        buyList : [],
        sellList : [],
        marketPrice : []
    }

    TradeHistory.find().sort({date: 'desc'}).limit(2).then(history =>{
        result.marketPrice = history
    })

    Trade.aggregate([{ $match : { type : 'buy' }}, { $limit : 10 }, { $group : { _id : '$price', quantity :{ $sum : '$quantity' } }}]).then( buyList =>{
        result.buyList = buyList
        Trade.aggregate([{ $match : { type : 'sell' }}, { $limit : 10 }, { $group : { _id : '$price', quantity :{ $sum : '$quantity' } }}]).then( sellList =>{
            result.sellList = sellList
            res.json(result)
        })
    })
})

//5-2. 차트
app.get('/trade/chart',(req, res) => {
    TradeHistory.aggregate([
        { $project : { price : '$price', date : {$add :['$date',1000 * 60 * 60 * 9] } } },
        { '$group' : { _id : { $dateToString : { format: "%Y-%m-%dT%H:00:00", date : { $toDate : '$date' } }},
            'high' : { '$max' : '$price'},
            'low' : { '$min' : '$price' },
            'open' : { '$first' : '$price' },
            'close' : { '$last' : '$price' }
        }},
        { '$sort' : { _id : 1 } }
    ]).then( chartData => {
        res.json(chartData)
    })
})

//6. 매수주문
app.post('/trade/buy',(req, res) => {
    User.findOne().where('userid').equals(req.body.userid).then((user) => {
        if(user.krw >= req.body.price * req.body.quantity){
            reqBuy(req.body.userid, Number(req.body.price), Number(req.body.quantity), res)
        } else {
            res.json({ result : 1, message : 'No available KRW' })
        }
    })

})


/*  function 매수 요청 (매수자, 매수호가, 매수량, res)
 sellOrder = 매도주문 호가리스트
 order = 매도주문
 total = 요청한 매수물량
 total == 0 요청한매수물량이 현재 order 매도물량이랑 같을때
 total > 0 현재 order 매도물량보다 많을떄
 total < 0 현재 order 매도물량보다 적을떄
 */

async function reqBuy(u, p, q, res){

        try {
            const sellOrder = await Trade.find().where('type').equals('sell')
                .where('price').equals(p).where('userid').sort({date: 'asc'})
            let total = q
            let task = Fawn.Task();
            if (sellOrder.length != 0) {
                sellOrder.some((order) => {
                    if (total == order.quantity) {
                        task.update('User', {userid: u}, { $set :{ avgPrice : p }}, {$inc: {krw: -( order.price * order.quantity ), btc: +order.quantity}})
                            .update('User', {userid: order.userid}, {$inc: {krw: +( order.price * order.quantity )}})
                            .remove('Trade', {_id: order._id})
                            .save('TradeHistory', {price: p, quantity: q, type: 'buy', date : moment(new Date().getTime()).tz('Asia/Seoul') })
                            .run({useMongoose: true})
                            .then(() => {
                                res.json({result: 0, message: 'Buy request success! '})
                            })
                            .catch((err) => {
                                res.json({result: 1, message: 'Buy request fail'})
                                console.log(err)
                            })
                        return true;
                    } else if (total > order.quantity) {
                        total -= order.quantity
                        task.update('User', {userid: u}, { $set :{ avgPrice : p }}, {$inc: { krw: -( order.price * order.quantity ), btc: +order.quantity }})
                            .update('User', {userid: order.userid}, {$inc: {krw: +( order.price * order.quantity )}})
                            .remove('Trade', {_id: order._id})
                            .save('TradeHistory', {price: p, quantity: q, type: 'buy', date : moment(new Date().getTime()).tz('Asia/Seoul')})
                            .run({useMongoose : true})
                            .then(() => {
                            })
                            .catch((err) => {
                                res.json({result: 1, message: 'Buy request fail'})
                                console.log(err)
                            })
                        if (total !=0 && sellOrder.lastIndexOf(order) == (sellOrder.length - 1)) {
                            task.update('User', { userid:u }, { $inc:{ krw : -( p *total ) }})
                                .save('Trade', {userid: u, price: p, quantity: total, type: 'buy'})
                                .run({useMongoose: true})
                                .then(() => {
                                    res.json({result: 0, message: 'Buy request success! '})
                                })
                                .catch((err) => {
                                    res.json({result: 1, message: 'Buy request fail! '})
                                    console.log(err)
                                })
                        }
                    } else if (total < order.quantity) {
                        task.update('User', {userid: u},  { $set :{ avgPrice : p }},  {$inc: {krw: - ( p * total ), btc: +total }})
                            .update('User', {userid: order.userid}, {$inc: {krw: +( p * total )}})
                            .update('Trade', {_id: order._id}, {$inc: {quantity: - total }})
                            .save('TradeHistory', {
                                price: p,
                                quantity: total,
                                type: 'buy',
                                date : moment(new Date().getTime()).tz('Asia/Seoul')
                            })
                            .run({useMongoose: true})
                            .then(() => {
                                res.json({result: 0, message: 'Buy request success!'})
                            })
                            .catch((err) => {
                                res.json({result: 1, message: 'Buy request fail'})
                                console.log(err)
                            })
                        return true;
                    }
                })
            } else {
                task.update('User', {userid: u}, {$inc: {krw: -( p * q )}})
                    .save('Trade', {userid: u, price: p, quantity: q, type: 'buy'})
                    .run({useMongoose: true})
                    .then(() => {
                        res.json({result: 0, message: 'Buy request success! '})
                    })
                    .catch((err) => {
                        res.json({result: 1, message: 'Buy request fail! '})
                        console.log(err)
                    })
            }
        }catch(err){
            console.log(err)
        }
}

//7. 매도주문
app.post('/trade/sell',(req, res) => {

    User.findOne().where('userid').equals(req.body.userid).then((user) => {
        if(user.btc >= req.body.quantity){
            reqSell(req.body.userid, Number(req.body.price), Number(req.body.quantity), res)
        } else {
            res.json({ result : 1, message : 'No available BTC' })
        }
    })
})

/*
 function 매도 요청 (매도자, 매도호가, 매도량, res)
 buyOrder = 매수주문 호가리스트
 order = 매수주문
 total = 요청한 매도물량
 total == 0 요청한매도물량이 현재 order 매수물량이랑 같을때
 total > 0 현재 order 매수물량보다 많을떄
 total < 0 현재 order 매수물량보다 적을떄
 */
async function reqSell(u, p, q, res){
    try {
        const buyOrder = await Trade.find().where('type').equals('buy')
            .where('price').equals(p).where('userid').sort({date: 'asc'})
        let total = q
        let task = Fawn.Task();
        if (buyOrder.length != 0) {
            buyOrder.some((order) => {
                if (total == order.quantity) {
                    task.update('User', { userid: u }, {$inc: { krw: + ( p * q ), btc: - q }})
                        .update('User', { userid: order.userid }, { $set :{ avgPrice : order.price }}, {$inc: { btc : + q }})
                        .remove('Trade', {_id: order._id})
                        .save('TradeHistory', {price: p, quantity: q, type: 'sell', date : moment(new Date().getTime()).tz('Asia/Seoul')})
                        .run({useMongoose: true})
                        .then(() => {
                            res.json({result: 0, message: 'Sell request success! '})
                        })
                        .catch((err) => {
                            res.json({result: 1, message: 'Sell request fail'})
                            console.log(err)
                        })
                    return true;
                } else if (total > order.quantity) {
                    total -= order.quantity
                    task.update('User', { userid: u }, {$inc: { krw: +( order.price * order.quantity ), btc: -order.quantity }})
                        .update('User', { userid: order.userid }, { $set :{ avgPrice : order.price }}, {$inc: {btc : +order.quantity }})
                        .remove('Trade', {_id: order._id})
                        .save('TradeHistory', {price: p, quantity: q, type: 'sell', date : moment(new Date().getTime()).tz('Asia/Seoul')})
                        .run({useMongoose: true})
                        .then(() => {
                        })
                        .catch((err) => {
                            res.json({result: 1, message: 'Sell request fail'})
                            console.log(err)
                        })
                    if (total !=0 && buyOrder.lastIndexOf(order) == (buyOrder.length - 1)) {
                        task.update('User', {userid: u }, { $inc:{ btc : -( total ) } })
                            .save('Trade', {userid: u, price: p, quantity: total, type: 'sell'})
                            .run({useMongoose: true})
                            .then(() => {
                                res.json({result: 0, message: 'Sell request success! '})
                            })
                            .catch((err) => {
                                res.json({result: 1, message: 'Sell request fail! '})
                                console.log(err)
                            })
                    }
                } else if (total < order.quantity) {
                    task.update('User', { userid: u }, {$inc: { krw: + ( p * total ), btc: -total }})
                        .update('User', { userid: order.userid }, { $set :{ avgPrice : order.price }}, {$inc: { btc : +total }})
                        .update('Trade', {_id: order._id}, { $inc: { quantity: -total }})
                        .save('TradeHistory', {price: p, quantity: total, type: 'sell', date : moment(new Date().getTime()).tz('Asia/Seoul')})
                        .run({useMongoose: true})
                        .then(() => {
                            res.json({result: 0, message: 'Sell request success!'})
                        })
                        .catch((err) => {
                            res.json({result: 1, message: 'Sell request fail'})
                            console.log(err)
                        })
                    return true;
                }
            })
        } else {
            task.update('User', {userid: u}, {$inc: {btc: -q}})
                .save('Trade', {userid: u, price: p, quantity: q, type: 'sell'})
                .run({useMongoose: true})
                .then(() => {
                    res.json({result: 0, message: 'Sell request success! '})
                })
                .catch((err) => {
                    res.json({result: 1, message: 'Sell request fail! '})
                    console.log(err)
                })
        }
    }catch(err){
        console.log(err)
    }
}




