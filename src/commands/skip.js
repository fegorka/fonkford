const { SlashCommandBuilder } = require('discord.js');
const mediaPlayer = require('@/utils/mediaPlayer');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('скип')
		.setDescription('[Медиа] Переключается на следующее видео в очереди'),
	async execute(interaction) {
		await mediaPlayer.skip(interaction);
	},
};