module.exports.createTemporaryChannel = createTemporaryChannel;
module.exports.deleteTemporaryChannel = deleteTemporaryChannel;
module.exports.checkTemporaryChannelAfterRestart = checkTemporaryChannelAfterRestart;


const logger = require('@/utils/logger');

const { addAutoVoiceData } = require('@/controllers/autoVoiceData/addAutoVoiceData.js');
const { getAutoVoiceData } = require('@/controllers/autoVoiceData/getAutoVoiceData.js');
const { remAutoVoiceData } = require('@/controllers/autoVoiceData/remAutoVoiceData.js');
const cache = require('@/utils/cache');


async function createTemporaryChannel(state) {
	const autoVoiceConfigCache = await cache.get('autoVoiceConfig');
	// const { primaryChannelId, primaryCategoryId } = autoVoiceConfigCache[0];
	let primaryChannelId = null;
	let primaryCategoryId = null;
	if (autoVoiceConfigCache === null || autoVoiceConfigCache === undefined) return;


	// Почему здесь какой-то кринж с [0] ? Дело в том, что бд предполагает как-то так настроена, что возвращает массив,
	// ну как монго-коллекцию, потому что мы поиск делаем, а результатов же много может быть
	// Но мы же знаем, что в конфиге можно получить только один элемент, вот к нему и обращаемся
	// Проблемы начинаются при перезаписи конфига, он почему-то записывается как объект, а не как массив, хотя действия происходят одинаковые,
	// и в качестве временной меры был применён такой код. Так что пока работает, не трогай))
	if (autoVoiceConfigCache[0] !== undefined && autoVoiceConfigCache[0] !== undefined) {
		// вот это срабатывает по дефолту
		primaryChannelId = autoVoiceConfigCache[0].primaryChannelId;
		primaryCategoryId = autoVoiceConfigCache[0].primaryCategoryId;
	}
	if (autoVoiceConfigCache.primaryChannelId !== undefined && autoVoiceConfigCache.primaryCategoryId !== undefined) {
		// вот это срабатывает после перезаписи конфига (именно, когда бот не перезапускался, если он перезапускается, то всё норм)
		primaryChannelId = autoVoiceConfigCache.primaryChannelId;
		primaryCategoryId = autoVoiceConfigCache.primaryCategoryId;
	}

	if (state.channel.id !== primaryChannelId) return;
	const channel = await state.guild.channels.create({
		type: 2,
		// voice type = 2
		// name: state.member.user.username,
		name: state.member.nickname,
		user_limit: 4,
		parent: primaryCategoryId,
	});
	logger.verbose(`[Util] Создан приватный голосовой канал ${channel.name} (${channel.id})`);
	await addAutoVoiceData({ temporaryChannelId: channel.id });
	await state.member.voice.setChannel(channel);
	logger.verbose(`[Util] ${state.member.user.name} (${state.member.user.id}) перемещён в голосовой канал ${channel.name} (${channel.id})`);
}

async function deleteTemporaryChannel(channel) {
	if (channel.members.size !== 0) {
		return;
	}
	const response = await getAutoVoiceData(channel.id);
	if (!response.success) {
		logger.error(`[Util] Ошибка запроса ${response.body}`);
		return;
	}
	if (response.body === null) {
		return;
	}
	await remAutoVoiceData({ temporaryChannelId: response.body.temporaryChannelId });
	await channel.delete();
	logger.verbose(`[Util] Удалён приватный голосовой канал ${channel.name} (${channel.id})`);
}


async function checkTemporaryChannelAfterRestart(client) {
	const response = await getAutoVoiceData();
	if (!response.success) {
		logger.error(`[Util] Ошибка запроса ${response.body}`);
		return;
	}
	if (response.body === null) {
		return;
	}

	findTemporaryChannelToDelete(client, response);
}

async function findTemporaryChannelToDelete(client, response) {
	response.body.forEach(channelData => {
		client.channels.fetch(channelData.temporaryChannelId).then(channel => {
			deleteTemporaryChannel(channel);
		}).catch(async error => {
			if (error.code !== 10003) logger.error(`[Util] Ошибка запроса при переборе каналов на удаление ${error}`);
			// 10003 = Unknown Channel
			await remAutoVoiceData({ temporaryChannelId: channelData.temporaryChannelId });
			logger.debug('[Util] Был удалён канал, записанный был в базе данных, но не найденный в Discord');
			await checkTemporaryChannelAfterRestart(client);
			return;
		});
	});
}