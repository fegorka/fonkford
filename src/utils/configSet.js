const cache = require('@/utils/cache');
const simpleEmbedBuilder = require('@/utils/simpleEmbedBuilder');


async function configSet(interaction, controller, args, cacheKey) {
	try {
		const response = await controller(args);
		if (response.success) {
			await cache.set(cacheKey, response.body);
			await interaction.reply({
				embeds: await simpleEmbedBuilder({
					description: `Конфигурация перезаписана`,
					type: 'success',
				}), ephemeral: true });
			return;
		}
		if (!response.success) {
			await interaction.reply({
				embeds: await simpleEmbedBuilder({
					description: `Ошибка базы данных`,
					type: 'error',
				}), ephemeral: true });
			return;
		}
	}
	catch (error) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Неизвестная ошибка`,
				type: 'error',
			}), ephemeral: true });
		return;
	}
}


module.exports = {
	configSet : configSet,
};