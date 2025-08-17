const mongoose = require('mongoose');
const Customizer = require('../Models/Customizer');

const clientschema  = new mongoose.Schema({
    name: { type: String , required: true},
    whatsapp: { type: String , required: true, unique: true},
    customizer: [{ type: mongoose.Schema.Types.ObjectId, ref:'Customizer', default:[] }],
}, { timestamps: true})
module.exports = mongoose.model('Client', clientschema);