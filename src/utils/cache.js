// cache.js
const logger = require('@/utils/logger');
const { getAdminNotifyConfig } = require('@/controllers/adminNotifyConfig/getAdminNotifyConfig.js');
const { getAutoVoiceConfig } = require('@/controllers/autoVoiceConfig/getAutoVoiceConfig.js');

const dataForCache = [
	{
		key: 'adminNotifyConfig',
		controller: getAdminNotifyConfig,
	},
	{
		key: 'autoVoiceConfig',
		controller: getAutoVoiceConfig,
	},
];

const cache = {};

async function set(key, value) {
	cache[key] = value;
	logger.debug(`[Cache] Успешное кэширование ${key}`);
}

async function get(key) {
	logger.debug(`[Cache] Успешное чтение кэша ${key}`);
	return cache[key];
}

// async function generate(cacheItems) {
//   for (const item of cacheItems) {
//     const { key, controller } = item;

//     try {
//       const controllerResponse = await controller();

//       if (controllerResponse.success) {
//         set(key, controllerResponse.body);
//       } else {
//         logger.error(`[Cache] Не удалось получить данные для кэширования ${key}`);
//       }
//     } catch (error) {
//       logger.error(`[Cache] Ошибка при выполнении контроллера для ${key}: ${error}`);
//     }
//   }
// }

// function generate(dataForCache) {
//   dataForCache.forEach(data => {
//     if (typeof data.controller !== 'function') {
//       logger.info(`[Cache] Контроллер для ${data.name} не является функцией`);
//       return;
//     }

//     const controllerResponse = data.controller(); // Вызываем контроллер как функцию
//     if (!controllerResponse.success) {
//       logger.info(`[Cache] Не удалось кэшировать ${data.name}`);
//     }
//     cache.set(data.name, controllerResponse.body);
//   });
// }

async function generate() {
	logger.debug(`[Cache] Идёт генерация кэша`);
	for (const data of dataForCache) {
		const response = await data.controller();
		if (!response.success) {
			logger.warn(`[Cache] Не удалось кэшировать ${data.key}`);
			return;
		}
		await set(data.key, response.body);
	}
}

// async function generate(dataForCache) {
// 	for (const data of dataForCache) {
// 		try {
// 			const response = await new Promise(resolve => {
// 				// Вызываем контроллер
// 				const controllerResult = data.controller();
// 				// Разрешаем промис с результатом контроллера
// 				resolve(controllerResult);
// 			});

// 			if (!response.success) {
// 				logger.info(`[Cache] Не удалось кэшировать ${data.key}`);
// 			}
// 			else {
// 				await set(data.key, response.body);
// 			}
// 		}
// 		catch (error) {
// 			logger.error(`[Cache] Ошибка при кэшировании ${data.key}: ${error}`);
// 		}
// 	}
// }

// function generate(dataForCache){
// 	dataForCache.forEach(data => {
// 		let response = data.controller();
// 		if (!response.success) {
// 			logger.info(`[Cache] Не удалось кэшировать ${data.key}`);
// 			return;
// 		}
// 		set(data.key, response.body);
// 	});
// }

module.exports = {
	set,
	get,
	generate,
};
