const { SlashCommandBuilder } = require('discord.js');
const mediaPlayer = require('@/utils/mediaPlayer');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('пауза')
		.setDescription('[Медиа] Приостанавливает или возобновляет воспроизведение видео'),
	async execute(interaction) {
		await mediaPlayer.pause(interaction);
	},
};