const { SlashCommandBuilder } = require('discord.js');
const { generateRandomHexString } = require('@/utils/simpleCrypto');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('случайный-hex')
		.setDescription('[crypto] генерирует случайную hex строку')
		.addNumberOption(option =>
			option.setName('длина-строки')
				.setDescription('Количество символов в генерируемой строке')
				.setMaxValue(1024)
				.setMinValue(4)
				.setRequired(false)),
	async execute(interaction) {
		await generateRandomHexString(interaction);
	} };