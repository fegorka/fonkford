const { addDndCharacterData } = require('@/controllers/dndCharacterData/addDndCharacterData');
const { getDndCharacterData } = require('@/controllers/dndCharacterData/getDndCharacterData');
const { remDndCharacterData } = require('@/controllers/dndCharacterData/remDndCharacterData');
const logger = require('@/utils/logger');
const crypto = require('crypto');
const { EmbedBuilder } = require('discord.js');
const simpleEmbedBuilder = require('@/utils/simpleEmbedBuilder');

async function dndCharacterCreate(interaction) {
	const response = await addDndCharacterData({
		userDiscordId: interaction.user.id,
		nameKey: `${crypto.createHash('sha1').update(`${(`${interaction.options.getString('имя')}${interaction.user.id}`).toLowerCase().trim()}`).digest('hex')}`,
		name: interaction.options.getString('имя'),
		mind: interaction.options.getNumber('разум'),
		charisma: interaction.options.getNumber('харизма'),
		agility: interaction.options.getNumber('ловкость'),
		strength: interaction.options.getNumber('сила'),
		description: interaction.options.getString('описание'),
		lore: interaction.options.getString('лор'),
		age: interaction.options.getNumber('возраст'),
	});
	if (response.success) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Персонаж ${interaction.options.getString('имя')} сохранён`,
				type: 'success',
			}), ephemeral: true });
		return;
	}
	if (response.body.code === 11000) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Персонаж с именем ${interaction.options.getString('имя')} уже существует`,
				type: 'warn',
			}), ephemeral: true });
		return;
	}
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Произошла ошибка при сохранении персонажа`,
			type: 'error',
		}), ephemeral: true });
}

async function dndCharacterGetNameList(interaction) {
	const response = await getDndCharacterData({ userDiscordId: interaction.user.id });
	if (!response.success) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Произошла ошибка при поиске персонажей`,
				type: 'error',
			}), ephemeral: true });
		return;
	}
	if (response.body.length === 0 || response.body === null || response.body === undefined) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Персонажи не найдены`,
				type: 'warn',
			}), ephemeral: true });
		return;
	}
	await dndCharacterNameListMessageSend(interaction, response.body);
}

async function dndCharacterGetByName(interaction) {
	const response = await getDndCharacterData({ nameKey:
		`${crypto.createHash('sha1').update(`${(`${interaction.options.getString('имя')}${interaction.user.id}`).toLowerCase().trim()}`).digest('hex')}`,
	});
	if (!response.success) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Произошла ошибка при поиске персонажа`,
				type: 'error',
			}), ephemeral: true });
		return;
	}
	if (response.body === null || response.body === undefined) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Персонаж ${interaction.options.getString('имя')} не найден`,
				type: 'warn',
			}), ephemeral: true });
		return;
	}
	if (interaction.options.getBoolean('json-формат') === true) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				title: response.body.name,
				description: `
					\`\`\`json
						${JSON.stringify(response.body, null, 2)}
					\`\`\``,
				type: 'success',
			}), ephemeral: true });
	}
	// await interaction.reply({ content: `> **НРИ** | ${response.body}`, ephemeral: true });
	await dndCharacterEmbedSend(interaction, response.body);
}

async function dndCharacterRemByName(interaction) {
	const response = await remDndCharacterData({ nameKey:
		`${crypto.createHash('sha1').update(`${(`${interaction.options.getString('имя')}${interaction.user.id}`).toLowerCase().trim()}`).digest('hex')}`,
	});
	logger.silly(JSON.stringify(response));
	if (!response.success) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Произошла ошибка при удалении персонажа`,
				type: 'error',
			}), ephemeral: true });
		return;
	}
	if (response.body === null || response.body === undefined || response.body.deletedCount === 0) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Персонаж ${interaction.options.getString('имя')} не найден`,
				type: 'warn',
			}), ephemeral: true });
		return;
	}
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Персонаж ${interaction.options.getString('имя')} удалён`,
			type: 'success',
		}), ephemeral: true });
}


async function dndCharacterNameListMessageSend(interaction, dndCharacterData) {
	let characterList = '';
	dndCharacterData.forEach(character => {
		characterList += `\`\`\` ${character.name}\`\`\`\n`;
	});
	await interaction.reply({ content: `> **НРИ** | Все персонажи \n ${characterList}`, ephemeral: true });

}

async function dndCharacterEmbedSend(interaction, dndCharacterData) {
	const characterInfoEmbed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`${dndCharacterData.name} (${dndCharacterData.age} лет)`)
		.setDescription(dndCharacterData.description)
		.addFields(
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Предыстория', value: dndCharacterData.lore },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Разум', value: `\`\`\`${dndCharacterData.mind} ✨\`\`\``, inline: true },
			{ name: 'Харизма', value: `\`\`\`${dndCharacterData.charisma} ✨\`\`\``, inline: true },
			{ name: '\u200B', value: '\u200B' },
			{ name: ' Ловкость', value: `\`\`\`${dndCharacterData.agility} ✨\`\`\``, inline: true },
			{ name: 'Сила', value: `\`\`\`${dndCharacterData.strength} ✨\`\`\``, inline: true },
		);
	await interaction.reply({ embeds: [characterInfoEmbed], ephemeral: true });
}


module.exports = {
	dndCharacterCreate,
	dndCharacterGetNameList,
	dndCharacterGetByName,
	dndCharacterRemByName,
};