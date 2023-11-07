const { SlashCommandBuilder } = require('discord.js');
const { generateShuffleString } = require('@/utils/simpleCrypto');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('перемешать-строки')
		.setDescription('[crypto] перемешивает 2 строки')
		.addStringOption(option =>
			option.setName('первая-строка')
				.setDescription('Случайная строка для перемешивания')
				.setMaxLength(128)
				.setMinLength(4)
				.setRequired(true))
		.addStringOption(option =>
			option.setName('вторая-строка')
				.setDescription('Случайная строка для перемешивания')
				.setMaxLength(128)
				.setMinLength(4)
				.setRequired(true)),
	async execute(interaction) {
		await generateShuffleString(interaction);
	},
};