const { SlashCommandBuilder } = require('discord.js');
const logger = require('@/utils/logger');
const simpleEmbedBuilder = require('@/utils/simpleEmbedBuilder');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('_краш')
		.setDescription('[Отладка] принудительно выключает бота')
		.setDefaultMemberPermissions(0),
	async execute(interaction) {
		logger.warn('Принудительное завершение работы бота командой');
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Бот был принудительно выключен`,
				type: 'success',
			}), ephemeral: true });
		process.exit(1);
	},
};