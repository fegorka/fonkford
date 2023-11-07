module.exports = {
	addDndCharacterData,
};

const logger = require('@/utils/logger');
const model = require('@/schemas/dndCharacterData');

async function addDndCharacterData({ userDiscordId, nameKey, name, mind, charisma, agility, strength, description, lore, age }) {
	logger.silly(`[Controller] Инициализация добавления записи в dndCharacterData`);
	const data = new model({
		userDiscordId: userDiscordId,
		nameKey: nameKey,
		name: name,
		description: description,
		lore: lore,
		mind: mind,
		charisma: charisma,
		agility: agility,
		strength: strength,
		age: age,
	});

	let success = null;
	let body = null;

	await data
		.save()
		.then((response) => {
			success = true;
			body = response;
			logger.debug(`[Controller] Запись успешно добавлена в dndCharacterData`);
		})
		.catch(error => {
			body = error;
			success = false;
			logger.debug(`[Controller] Ошибка при добавлении записи в dndCharacterData ${error}`);
		});

	return {
		success: success,
		body: body,
	};
}