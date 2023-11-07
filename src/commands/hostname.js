const { SlashCommandBuilder } = require('discord.js');
const simpleEmbedBuilder = require('@/utils/simpleEmbedBuilder');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('_хост-инфо')
		.setDescription('[Отладка] вывод имени хоста')
		.setDefaultMemberPermissions(0),
	async execute(interaction) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Имя хоста ${require("os").hostname()})`,
				type: 'success',
			}), ephemeral: true,
		});
	},
};