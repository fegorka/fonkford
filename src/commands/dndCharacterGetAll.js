const { SlashCommandBuilder } = require('discord.js');
const { dndCharacterGetNameList } = require('@/utils/dndCharacter');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('мои-персонажи')
		.setDescription('[НРИ] показывает список всех персонажей'),
	async execute(interaction) {
		await dndCharacterGetNameList(interaction);
	},
};