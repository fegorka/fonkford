module.exports = {
	addAutoVoiceData : addAutoVoiceData,
};

const logger = require('@/utils/logger');
const model = require('@/schemas/autoVoiceData');

async function addAutoVoiceData({ temporaryChannelId }) {
	logger.silly(`[Controller] Инициализация добавления записи в autoVoiceData`);

	const data = new model({
		temporaryChannelId: temporaryChannelId,
	});

	let success = null;
	let body = null;

	await data
		.save()
		.then((response) => {
			success = true;
			body = response;
			logger.debug(`[Controller] Запись успешно добавлена в autoVoiceData`);
		})
		.catch(error => {
			body = error;
			success = false;
			logger.debug(`[Controller] Опшибка при добавлении записи в autoVoiceData ${error}`);
		});

	return {
		success: success,
		body: body,
	};
}