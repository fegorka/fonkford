const logger = require('@/utils/logger');
const mediaPlayer = require('@/utils/mediaPlayer');
const { VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
	name: VoiceConnectionStatus.Ready,
	once: false,
	async execute() {
		logger.silly(`[Event] Статус подключения бота – Ready`);
		await mediaPlayer.checkQueueStatus();
	},
};