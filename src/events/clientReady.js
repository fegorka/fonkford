const logger = require('../utils/logger');
const { checkTemporaryChannelAfterRestart } = require('@/utils/autoVoice');
const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		logger.info(`[Event] Бот запущен ${client.user.tag}`);
		await checkTemporaryChannelAfterRestart(client);
	},
};