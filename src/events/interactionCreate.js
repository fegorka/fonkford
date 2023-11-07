const logger = require('@/utils/logger');
const { Events } = require('discord.js');
const simpleEmbedBuilder = require('@/utils/simpleEmbedBuilder');


module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
		await commandHandler(interaction);
	},
};

async function commandHandler(interaction) {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		logger.error(`[Event] Не удалось найти команду ${interaction.commandName}`);
		return;
	}
	try {
		logger.silly(`[Event] ${interaction.member.user.username} (${interaction.member.user.id}) использовал команду /${interaction.commandName} в канале ${interaction.channel.name} (${interaction.channel.id})`);
		await command.execute(interaction);
	}
	catch (error) {
		logger.error(`[-> Event] При выполнении команды возникла ошибка ${error}`);
		// Unknown interaction
		if (error.code === 10062) return;
		// Invalid form body
		if (error.code === 50035) return;
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `При выполнении команды возникла неизвестная ошибка`,
				type: 'error',
			}), ephemeral: true });
	}
}
