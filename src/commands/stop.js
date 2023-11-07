const { SlashCommandBuilder } = require('discord.js');
const mediaPlayer = require('@/utils/mediaPlayer');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('остановить')
		.setDescription('[Медиа] Отменяет воспроизведение видео'),
	async execute(interaction) {
		await mediaPlayer.stop(interaction);
	},
};
