const logger = require('@/utils/logger');
const mediaPlayer = require('@/utils/mediaPlayer');
const { VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
	name: VoiceConnectionStatus.Disconnected,
	once: false,
	async execute() {
		logger.silly(`[Event] Статус подключения бота – Disconnected`);
		await mediaPlayer.stop();
	},
};