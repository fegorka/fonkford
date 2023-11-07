const { SlashCommandBuilder } = require('discord.js');
const cache = require('@/utils/cache');
const simpleEmbedBuilder = require('@/utils/simpleEmbedBuilder');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('_получить-кэш')
		.setDescription('[Отладка] получить объекты кэша')
		.setDefaultMemberPermissions(0)
		.addStringOption(option =>
			option.setName('ключ')
				.setDescription('ключ объекта')
				.setMaxLength(64)
				.setRequired(true)),
	async execute(interaction) {
		const cacheData = await cache.get(interaction.options.getString('ключ'));
		if (cacheData === null || cacheData === undefined) {
			await interaction.reply({
				embeds: await simpleEmbedBuilder({
					description: `Объект по такому ключу не найден (${interaction.options.getString('ключ')})`,
					type: 'warn',
				}), ephemeral: true });
			return;
		}
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				title: `Кэш по ключу ${interaction.options.getString('ключ')}`,
				description: `
				\`\`\`json
				${JSON.stringify(cacheData, null, 2)}
				\`\`\``,
				type: 'success',
			}), ephemeral: true });
	},
};
