module.exports = {
	getAdminNotifyConfig,
};

const logger = require('@/utils/logger');
const model = require('@/schemas/adminNotifyConfig');

async function getAdminNotifyConfig(id = null) {
	logger.debug(`[Controller] Инициализация получения записей в adminNotifyConfig`);
	const options = {};
	const filter = {};

	let success = null;
	let body = null;

	try {
		let response;
		if (id !== null) {
			response = await model.findOne({ temporaryChannelId: id });
			logger.debug(`[Controller] Инициализация получения конкретной записи в adminNotifyConfig`);
		}
		else {
			response = await model.find(filter, options);
		}
		success = true;
		body = response;
		logger.debug(`[Controller] Запись успешно получена в adminNotifyConfig`);
	}
	catch (error) {
		body = error;
		success = false;
		logger.error(`[Controller] Ошибка получения записи в adminNotifyConfig ${error}`);
	}
	return {
		success: success,
		body: body,
	};
}
