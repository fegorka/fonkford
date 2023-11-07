module.exports = {
	getUserInfoById,
};

const logger = require("@/utils/logger");
const simpleEmbedBuilder = require("@/utils/simpleEmbedBuilder");

async function getUserInfoById({ interaction, userId }) {
	logger.debug(`userID = ${userId}`);
	if (!RegExp(/^\d+$/).test(userId)) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `id пользователя должен быть числом`,
				type: 'warn',
			}), ephemeral: true });
		return;
	}
	const member = await interaction.guild.members.fetch(userId).catch(async () => {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Пользователь с id ${userId} не найден`,
				type: 'warn',
			}), ephemeral: true });
		return;
	});
	if (member === undefined || member === null) return;
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			title: `${member.displayName || ''} @${member.user.username || ''} #${member.user.discriminator || ''}`,
			description: `
				\`\`\`json
					${JSON.stringify(member, null, 2)}
				\`\`\`
				\`\`\`json
					${JSON.stringify(member.user, null, 2)}
				\`\`\`
			`,
			type: 'success',
		}), ephemeral: true });
}
