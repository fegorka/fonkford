const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { configSet } = require('@/utils/configSet.js');
const { setAutoVoiceConfig } = require('@/controllers/autoVoiceConfig/setAutoVoiceConfig.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('_конфиг-autovoice')
		.setDescription('[Отладка] перезапись конфига autoVoice')
		.setDefaultMemberPermissions(0)

		.addChannelOption(optionChannel =>
			optionChannel.setName('канал')
				.setDescription('Канал иницитирующий создание пользовательских каналов')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildVoice))

		.addChannelOption(optionCategory =>
			optionCategory.setName('категория')
				.setDescription('Категория размещения пользовательских каналов')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildCategory)),
	async execute(interaction) {
		await configSet(
			interaction,
			setAutoVoiceConfig,
			{
				primaryChannelId: interaction.options.getChannel('канал').id,
				primaryCategoryId: interaction.options.getChannel('категория').id,
			},
			'autoVoiceConfig',
		);
	},
};

