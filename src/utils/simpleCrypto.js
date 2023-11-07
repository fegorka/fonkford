const simpleEmbedBuilder = require('@/utils/simpleEmbedBuilder');

module.exports = {
	generateRandomHexString,
	generateShuffleString,
};

async function generateRandomHexString(interaction) {
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `${await generateRandomHex((interaction.options.getNumber('длина-строки') || 8))}`,
			type: 'success',
		}),
		ephemeral: true,
	});
}

async function generateShuffleString(interaction) {
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `${await shuffleStrings(interaction.options.getString('первая-строка'), interaction.options.getString('вторая-строка'))}`,
			type: 'success',
		}),
		ephemeral: true,
	});
}

async function generateRandomHex(length = 8) {
	const characters = "0123456789abcdef";
	const result = Array.from({ length },
		() => characters[Math.floor(Math.random() * characters.length)]).join("");
	return result;
}

async function shuffleStrings(stringFirst, stringSecond) {
	const shuffledArray = Array.from(stringFirst + stringSecond);

	for (let i = shuffledArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
	}
	return shuffledArray.join("");
}
