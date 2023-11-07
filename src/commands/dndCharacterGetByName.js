const { SlashCommandBuilder } = require('discord.js');
const { dndCharacterGetByName } = require('@/utils/dndCharacter');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('найти-персонажа')
		.setDescription('[НРИ] ищет персонажа')
		.addStringOption(option =>
			option.setName('имя')
				.setDescription('Имя Фамилия или Прозвище персонажа, которого нужно найти')
				.setMaxLength(64)
				.setMinLength(3)
				.setRequired(true))
		.addBooleanOption(option =>
			option.setName('json-формат')
				.setDescription('Получить информацию в формате JSON')
				.setRequired(false)),
	async execute(interaction) {
		await dndCharacterGetByName(interaction);
	},
};
