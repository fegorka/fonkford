const logger = require('@/utils/logger');
const { Events } = require('discord.js');
const { createTemporaryChannel, deleteTemporaryChannel } = require('@/utils/autoVoice.js');
const mediaPlayer = require('@/utils/mediaPlayer.js');
const cache = require('@/utils/cache');


module.exports = {
	name: Events.VoiceStateUpdate,
	once: false,
	async execute(oldState, newState) {
		await autoVoice(oldState, newState);
		await checkEmptyChannel(oldState, newState);
		await botLeave(oldState, newState);
	},
};

async function autoVoice(oldState, newState) {
	const isUserDisconnect = (oldState.channel && !newState.channel);
	const isUserConnect = (!oldState.channel && newState.channel);
	const isUserMoved = ((oldState.channel && newState.channel) && (oldState.channel !== newState.channel));

	if ((isUserConnect || isUserMoved)) {
		logger.silly(`[Event] ${newState.member.user.username} (${newState.member.user.id}) подключился к голосовому каналу ${newState.channel.name} (${newState.channel.id})`);
		if (newState.channel.members.first().user.bot) {
			if (newState.channel.id === (await cache.get('autoVoiceConfig'))[0].primaryChannelId) newState.channel.members.first().voice.disconnect();
			return;
		}
		await createTemporaryChannel(newState).catch(error => logger.error(`[Event] Ошибка создания временного канала ${error}`));
	}
	if (isUserDisconnect || isUserMoved) {
		logger.silly(`[Event] ${newState.member.user.username} (${newState.member.user.id}) покинул голосовой канал ${oldState.channel.name} (${oldState.channel.id})`);
		await deleteTemporaryChannel(oldState.channel).catch(error => logger.error(`[Event] Ошибка удаления временного канала ${error}`));
	}
}

async function botLeave(oldState, newState) {
	if (!oldState.channel || newState.channel || !oldState.member.user.bot) return;
	logger.silly(`[Event] Бот покинул голосовой канал и воспроизведение медиа было отменено`);
	await mediaPlayer.stop();
}


async function checkEmptyChannel(oldState, newState) {
	const isUserDisconnect = (oldState.channel && !newState.channel);
	const isUserMoved = ((oldState.channel && newState.channel) && (oldState.channel !== newState.channel));
	const isUserBot = (oldState.member.user.bot);
	if (oldState.channel === null || oldState.channel === undefined) return;
	if (!(isUserDisconnect || isUserMoved) || isUserBot) return;
	if (oldState.channel.members.first() === undefined || oldState.channel.members.first() === null) return;
	if (!oldState.channel.members.first().user.bot) return;
	await oldState.channel.members.first().voice.disconnect();
	// mediaPlayer.stop() добавлен поскольку botLeave почему-то не вызывается от voice.disconnect(),
	// но если кикнуть бота интерфейсом дискорда она работает нормально, пока оставим так
	await mediaPlayer.stop();
	logger.silly(`[Event] Бот остался один, в связи с чем покинул канал`);
}

