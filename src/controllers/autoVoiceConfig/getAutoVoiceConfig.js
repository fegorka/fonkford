module.exports = {
	getAutoVoiceConfig,
};

const logger = require('@/utils/logger');
const model = require('@/schemas/autoVoiceConfig');

async function getAutoVoiceConfig(id = null) {
	logger.debug(`[Controller] Инициализация получения записей в autoVoiceConfig`);
	const options = {};
	const filter = {};

	let success = null;
	let body = null;

	try {
		let response;
		if (id !== null) {
			response = await model.findOne({ temporaryChannelId: id });
			logger.debug(`[Controller] Инициализация получения конкретной записи в autoVoiceConfig`);
		}
		else {
			response = await model.find(filter, options);
		}
		success = true;
		body = response;
		logger.debug(`[Controller] Запись успешно получена в autoVoiceConfig`);
	}
	catch (error) {
		body = error;
		success = false;
		logger.error(`[Controller] Ошибка получения записи в autoVoiceConfig ${error}`);
	}
	return {
		success: success,
		body: body,
	};
}
