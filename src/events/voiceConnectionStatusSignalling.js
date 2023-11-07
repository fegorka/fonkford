const logger = require('@/utils/logger');
const { VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
	name: VoiceConnectionStatus.Signalling,
	once: false,
	async execute() {
		logger.silly(`[Event] Статус подключения бота – Signalling`);
	},
};