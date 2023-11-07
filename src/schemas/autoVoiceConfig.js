const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const model = new Schema({
	primaryChannelId: {
		type: String,
		default: 'null',
		required: true,
	},
	primaryCategoryId: {
		type: String,
		default: 'null',
		required: true,
	},
}, { timestamps: false });


module.exports = mongoose.model('autoVoiceConfig', model);