const { SlashCommandBuilder } = require('discord.js');
const { dndCharacterCreate } = require('@/utils/dndCharacter');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('создать-персонажа')
		.setDescription('[НРИ] создаёт персонажа')
		.addStringOption(option =>
			option.setName('имя')
				.setDescription('[Основное] Имя Фамилия или Прозвище персонажа')
				.setMaxLength(64)
				.setMinLength(3)
				.setRequired(true))
		.addNumberOption(option =>
			option.setName('разум')
				.setDescription('[Статы] Способности персонажа связанные с мышлением, в том числе и психической устойчивостью')
				.setMaxValue(5)
				.setMinValue(-1)
				.setRequired(true))
		.addNumberOption(option =>
			option.setName('харизма')
				.setDescription('[Статы] Способности персонажа связанные с оказанием впечатления на окружающих')
				.setMaxValue(5)
				.setMinValue(-1)
				.setRequired(true))
		.addNumberOption(option =>
			option.setName('ловкость')
				.setDescription('[Статы] способности персонажа связанные с ловкостью и реакцией')
				.setMaxValue(5)
				.setMinValue(-1)
				.setRequired(true))
		.addNumberOption(option =>
			option.setName('сила')
				.setDescription('[Статы] Способности персонажа связанные с физической силой и телосложением')
				.setMaxValue(5)
				.setMinValue(-1)
				.setRequired(true))
		.addStringOption(option =>
			option.setName('описание')
				.setDescription('[Основное] То как выглядит персонаж, его черты характера, голос, особенности поведения и т.д.')
				.setMaxLength(280)
				.setMinLength(3)
				.setRequired(true))
		.addStringOption(option =>
			option.setName('лор')
				.setDescription('[Основное] Предыстория персонажа, его становление, события из его прошлого')
				.setMaxLength(280)
				.setMinLength(3)
				.setRequired(true))
		.addNumberOption(option =>
			option.setName('возраст')
				.setDescription('[Основное] Примерный возраст персонажа (человеческих лет)')
				.setMaxValue(1000)
				.setMinValue(10)
				.setRequired(true)),
	async execute(interaction) {
		await dndCharacterCreate(interaction);
	},
};