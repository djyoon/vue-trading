const mongoose = require('mongoose');

const tradeSchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    price: Number,
    quantity : Number,
    type : String,
    userid : String,
    status : { type : String, default : 'pending' },
    date : { type: Date, default: Date.now }
});

var Trade = mongoose.model('Trade', tradeSchema);
module.exports = Trade;