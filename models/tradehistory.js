const mongoose = require('mongoose');

const tradeHistorySchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    price: Number,
    quantity : Number,
    type : String,
    date : { type: Date, default: Date.now }
});

var TradeHistory = mongoose.model('TradeHistory', tradeHistorySchema);
module.exports = TradeHistory;