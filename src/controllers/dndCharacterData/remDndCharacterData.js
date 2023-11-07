module.exports = {
	remDndCharacterData,
};

const logger = require('@/utils/logger');
const model = require('@/schemas/dndCharacterData');

async function remDndCharacterData({ nameKey }) {
	logger.debug(`[Controller] Инициализация удаления записи в dndCharacterData`);

	let success = null;
	let body = null;

	await model
		.deleteOne({ nameKey: nameKey })
		.then((response) => {
			success = true;
			body = response;
			logger.debug(`[Controller] Запись успешно удалена в dndCharacterData ${response}}`);
		})
		.catch(error => {
			body = error;
			success = false;
			logger.error(`[Controller] Ошибка удаления записи в dndCharacterData ${error}`);
		});

	return {
		success: success,
		body: body,
	};
}