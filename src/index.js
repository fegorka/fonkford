require('dotenv').config();
require('module-alias/register.js');
const cache = require('@/utils/cache');
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const logger = require('@/utils/logger');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.GuildMessages,
] });


async function index() {
	logger.info(`[App] Режим запуска ${process.env.RUN_MODE}`);
	logger.info(`[App] Уровень логирования DEV: ${process.env.DEV_LOGGER_LEVEL} | PROD: ${process.env.PROD_LOGGER_LEVEL}`);
	logger.info(`[App] TOTAL-STACK-TRACE: ${process.env.TOTAL_STACK_TRACE}`);
	logger.info(`[App] Инициализация подключения к базе данных`);

	client.commands = new Collection();
	await connectionToMongoDb();
	await cache.generate();
	await commandGen();
	await eventGen();
	await client.login(process.env.TOKEN);
}


async function connectionToMongoDb() {
	await mongoose
		.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.qm6kypp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
			{ useNewUrlParser: true, useUnifiedTopology: true })
		.then(async (response) => {
			logger.info(`[App] База данных подключена ${response.connection.host}`);
		})
		.catch(error => logger.error(`[App] Ошибка подключения базы данных ${error}`));
}

async function commandGen() {
	logger.debug(`[App] Инициализация команд`);
	const commandsPath = path.join(__dirname, './commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			logger.info(`[App] Обновлена команда ${command.data.name}`);
		}
		else {
			logger.warn(`[App] Команда в ${filePath} не содержит обязательного свойства data или execute`);
		}
	}
}

async function eventGen() {
	const eventsPath = path.join(__dirname, './events');
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
			logger.info(`[App] Обновлён единоразовый ивент ${event.name}`);
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
			logger.info(`[App] Обновлён стандартный ивент ${event.name}`);
		}
	}
}

index();