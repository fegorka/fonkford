const { SlashCommandBuilder } = require('discord.js');
const mediaPlayer = require('@/utils/mediaPlayer');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('играть')
		.setDescription('[Медиа] воспроизводит видео по ссылке')
		.addStringOption(option =>
			option.setName('url')
				.setDescription('URL видео на YouTube')
				.setRequired(true)),
	async execute(interaction) {
		await mediaPlayer.play(interaction, interaction.options.getString('url'));
	},
};
