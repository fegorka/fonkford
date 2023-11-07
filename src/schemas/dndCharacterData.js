const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const model = new Schema({
	userDiscordId: {
		type: String,
		maxlength: 20,
		minlength: 17,
		unique: false,
		required: true,
	},
	nameKey: {
		type: String,
		maxlength: 72,
		minlength: 24,
		unique: true,
		required: true,
	},
	name: {
		type: String,
		maxlength: 50,
		minlength: 3,
		default: 'Без имени',
		unique: false,
		required: true,
	},
	age: {
		type: Number,
		max: 1000,
		min: 10,
		default: 33,
		unique: false,
		required: true,
	},
	description: {
		type: String,
		maxlength: 280,
		minlength: 3,
		default: 'Без описания',
		unique: false,
		required: false,
	},
	lore: {
		type: String,
		maxlength: 280,
		minlength: 3,
		default: 'Без предыстории',
		unique: false,
		required: false,
	},
	mind: {
		type: Number,
		max: 99,
		default: -1,
		unique: false,
		required: true,
	},
	charisma: {
		type: Number,
		max: 99,
		default: -1,
		unique: false,
		required: true,
	},
	agility: {
		type: Number,
		max: 99,
		default: -1,
		unique: false,
		required: true,
	},
	strength: {
		type: Number,
		max: 99,
		default: -1,
		unique: false,
		required: true,
	},
}, { timestamps: true });


module.exports = mongoose.model('dndCharacterData', model);