const mongoose = require('mongoose');

const customizershema  = new mongoose.Schema({
    CURL: { type: String , required: true},
    subscription: { type: String, required: true},
}, { timestamps: true})

module.exports = mongoose.model('Customizer', customizershema);



