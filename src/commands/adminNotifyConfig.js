const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { configSet } = require("@/utils/configSet.js");
const { setAdminNotifyConfig } = require("@/controllers/adminNotifyConfig/setAdminNotifyConfig.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("_конфиг-adminnotify")
		.setDescription("[Отладка] перезапись конфига adminNotify")
		.setDefaultMemberPermissions(0)

		.addChannelOption((optionChannel) =>
			optionChannel
				.setName("канал")
				.setDescription("Канал для уведомлений бот -> админ")
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText),
		),
	async execute(interaction) {
		await configSet(
			interaction,
			setAdminNotifyConfig,
			{ primaryChannelId: interaction.options.getChannel("канал").id },
			'adminNotifyConfig',
		);
	},
};
