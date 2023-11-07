module.exports = {
	setAdminNotifyConfig : setAdminNotifyConfig,
};

const model = require('@/schemas/adminNotifyConfig.js');
// const { getCashe } = require('../store/getCashe.js');
const cache = require('@/utils/cache');

async function setAdminNotifyConfig({ primaryChannelId }) {

	const filter = { };

	const update = { primaryChannelId: primaryChannelId };

	const options = {
		upsert: true,
		new: true,
	};

	let success = null;
	let body = null;

	await model
		.findOneAndUpdate(filter, update, options)
		.then((response) => {
			// getCashe(['adminNotifyConfigs']);
			cache.set('adminNotifyConfig', response);
			success = true;
			body = response;
		})
		.catch(error => {
			body = error;
			success = false;
		});

	return {
		success: success,
		body: body,
	};
}