const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    userid: String,
    userpw: String,
    krw : { type : Number, default : 10 },
    btc : { type : Number, default : 10 },
    date : { type: Date, default: Date.now },
    // avg Price 평균구매금액
    avgPrice : { type : Number, default : 0 }
});

var User = mongoose.model('User', UserSchema);
module.exports = User;