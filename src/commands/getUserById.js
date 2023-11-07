const { SlashCommandBuilder } = require('discord.js');
const { getUserInfoById } = require('@/utils/getUserInfoById.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('_данные-участника')
		.setDescription('[Отладка] получить объекты member и user участника. Если параметры не заданы, возвращает данные бота')
		.setDefaultMemberPermissions(0)
		.addUserOption(option =>
			option.setName('участник')
				.setDescription('получить данные через выбор из списка')
				// .setMaxLength(18)
				.setRequired(false))
		.addStringOption(option =>
			option.setName('id')
				.setDescription('получить данные по id')
				.setRequired(false)),
	async execute(interaction) {
		const userId = () => {
			if (interaction.options.getString('id') === null && interaction.options.getUser('участник') === null) {
				return interaction.client.user.id;
			}
			if (interaction.options.getUser('участник') === null) {
				return interaction.options.getString('id');
			}
			return interaction.options.getUser('участник').id;
		};
		await getUserInfoById({
			interaction,
			userId: userId(),
		});
	},
};
