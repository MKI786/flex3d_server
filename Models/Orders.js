const mongoose = require('mongoose');

const OrdersSchema = new mongoose.Schema({
    order_name: { type: String, required: true },
    order_address: { type: String, required: true },
    order_mobile: { type: String, required: true },
    order_model: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model("Orders", OrdersSchema);
