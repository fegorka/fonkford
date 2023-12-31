const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const model = new Schema(
	{
		temporaryChannelId: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("autoVoiceData", model);
