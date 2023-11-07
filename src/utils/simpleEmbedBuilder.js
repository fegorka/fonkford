const { EmbedBuilder } = require('discord.js');

/**
 *
 * @param {string} title Заголовок
 * @param {string} description Описание
 * @param {string} type Тип сообщения (ошибка, предупреждение и т.д.), отвечает за цвет
 * @param {boolean} ephemeral Ответ будет виден только пользователю, который его получил
 * @param {string} url Ссылка в заголовке
 * @returns {array} Массив embeds для interaction.reply или interaction.send
 */
async function simpleEmbedBuilder({ title = null, description = null, type = null, url = null }) {
	const characterInfoEmbed = new EmbedBuilder()
		.setColor(getColorByType(type))
		.setTitle(title);
	if (description !== null) characterInfoEmbed.setDescription(description);
	if (url !== null) characterInfoEmbed.setURL(url);
	return [characterInfoEmbed];
}

function getColorByType(type) {
	if (type === 'default' || type === null) return 0x7658F0;
	if (type === 'error') return 0xFD4079;
	if (type === 'warn') return 0xFFCD00;
	if (type === 'success') return 0x6FD882;
	if (type === 'debug') return 0xD27B55;
}

module.exports = simpleEmbedBuilder;
