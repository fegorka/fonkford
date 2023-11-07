module.exports = {
	getAutoVoiceData,
};

const logger = require('@/utils/logger');
const model = require('@/schemas/autoVoiceData');

async function getAutoVoiceData(id = null) {
	logger.debug(`[Controller] Инициализация получения записей в autoVoiceData`);
	const options = {};
	const filter = {};

	let success = null;
	let body = null;

	try {
		let response;
		if (id !== null) {
			response = await model.findOne({ temporaryChannelId: id });
			logger.debug(`[Controller] Инициализация получения конкретной записи в autoVoiceData`);
		}
		else {
			response = await model.find(filter, options);
		}
		success = true;
		body = response;
		logger.debug(`[Controller] Запись успешно получена в autoVoiceData`);
	}
	catch (error) {
		body = error;
		success = false;
		logger.error(`[Controller] Ошибка получения записи в autoVoiceData ${error}`);
	}
	return {
		success: success,
		body: body,
	};
}
