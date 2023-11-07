module.exports = {
	getDndCharacterData,
};

const logger = require('@/utils/logger');
const model = require('@/schemas/dndCharacterData');

async function getDndCharacterData({ nameKey = null, userDiscordId = null }) {
	logger.debug(`[Controller] Инициализация получения записей в dndCharacterData`);
	const options = {};
	const filter = {};

	let success = null;
	let body = null;

	try {
		let response;
		if (nameKey !== null) {
			response = await model.findOne({ nameKey: nameKey });
			logger.debug(`[Controller] Инициализация получения конкретной записи в dndCharacterData`);
		}
		else if (userDiscordId !== null) {
			response = await model.find({ userDiscordId: userDiscordId });
			logger.debug(`[Controller] Инициализация получения конкретных записей в dndCharacterData`);
		}
		else {
			response = await model.find(filter, options);
		}
		success = true;
		body = response;
		logger.debug(`[Controller] Запись успешно получена в dndCharacterData`);
	}
	catch (error) {
		body = error;
		success = false;
		logger.error(`[Controller] Ошибка получения записи в dndCharacterData ${error}`);
	}
	return {
		success: success,
		body: body,
	};
}
