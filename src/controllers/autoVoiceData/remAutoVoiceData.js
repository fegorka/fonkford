module.exports = {
	remAutoVoiceData : remAutoVoiceData,
};

const logger = require('@/utils/logger');
const model = require('@/schemas/autoVoiceData');

async function remAutoVoiceData({ temporaryChannelId }) {
	logger.debug(`[Controller] Инициализация удаления записи в autoVoiceData`);

	let success = null;
	let body = null;

	await model
		.deleteOne({ temporaryChannelId: temporaryChannelId })
		.then((response) => {
			success = true;
			body = response;
			logger.debug(`[Controller] Запись успешно удалена в autoVoiceData ${response}}`);
		})
		.catch(error => {
			body = error;
			success = false;
			logger.error(`[Controller] Опшибка удаления записи в autoVoiceData ${error}`);
		});

	return {
		success: success,
		body: body,
	};
}