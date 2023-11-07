/*

Регистрировать команды в боте можно определённое кол-во раз в день,
чтобы не делать это при каждом перезапуске, создан этот модуль

*/

require('dotenv').config();
require('module-alias/register.js');
const logger = require('./utils/logger');

const { REST, Routes } = require('discord.js');
const clientId = process.env.CLIENT_ID;

const path = require('node:path');
const fs = require('node:fs');
const commands = [];

const commandsPath = path.join(__dirname, './commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
	try {
		logger.info(`Начато обновление ${commands.length} (/) команд `);
		// Метод put для полного обновления команд
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);
		logger.info(`Успешно обновлено ${data.length} (/) команд)`);

	}
	catch (error) { console.error(error); }
})();