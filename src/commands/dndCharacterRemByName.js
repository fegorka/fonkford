const { SlashCommandBuilder } = require('discord.js');
const { dndCharacterRemByName } = require('@/utils/dndCharacter');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('удалить-персонажа')
		.setDescription('[НРИ] удаляет персонажа')
		.addStringOption(option =>
			option.setName('имя')
				.setDescription('Имя Фамилия или Прозвище персонажа, которого нужно найти')
				.setMaxLength(64)
				.setMinLength(3)
				.setRequired(true)),
	async execute(interaction) {
		await dndCharacterRemByName(interaction);
	} };