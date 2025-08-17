const mongoose = require('mongoose');

const ModelSchema = new mongoose.Schema({
    modelName: { type: String, required: true },
    modelUrl: { type: String, required: true },
    modelThumbnailurl: { type: String, required: true },
    modelTextureurl: [{ type: String, required: true }]
}, { timestamps: true });

module.exports = mongoose.model("Model", ModelSchema);