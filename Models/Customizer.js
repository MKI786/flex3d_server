const mongoose = require('mongoose');
require('../Models/Model');

const customizershema = new mongoose.Schema({
    CURL: { type: String, required: true },
    subscription: { type: String, required: true },
    Model: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Model', default: [] }],
}, { timestamps: true })

module.exports = mongoose.model('Customizer', customizershema);



