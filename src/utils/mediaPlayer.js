const ytdl = require('ytdl-core');
const logger = require('@/utils/logger');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const simpleEmbedBuilder = require('@/utils/simpleEmbedBuilder');


const state = {
	audioPlayer: createAudioPlayer(),
	connection: null,
	queue: [],
	queueVideoIndex: 0,
	isPaused: false,
};


async function play(interaction, url) {
	if (!await checkUserIsInVoiceChannel(interaction)) return;
	if (!await checkUrlIsValid(interaction, url)) return;
	if (await checkVideoIsUnavailableAndSendMessages(interaction, url)) return;

	const connection = await createNewOrUseExistingConnection({
		connection: state.connection,
		voiceChannelId: interaction.member.voice.channel.id,
		guildId: interaction.guildId,
		adapterCreator: interaction.guild.voiceAdapterCreator,
	});
	await setStateConnection(connection);

	const queue = await addMediaToQueue(state.queue, url);
	await setStateQueue(queue);
	logger.debug(`[Utils] Медиа добавлено в очередь (${queue.length}) ${url}`);

	if (!await checkQueueIsEmptyAndSendStartingPlayerMessages(queue, interaction, url)) return;

	await startPlayer(connection, state.audioPlayer, queue, state.queueVideoIndex);
	await onIdleAudioPlayer(state.audioPlayer);
}

async function skip(interaction = null) {
	if (interaction) {
		if (!await checkIsPlayingAndIsConnection(interaction, state.audioPlayer, state.connection)) return;
		if (!await checkUserIsInVoiceChannel(interaction)) return;
	}
	if (await checkIsVideoLastInQueue(interaction, state.queue, state.queueVideoIndex)) return;

	await setStateQueueVideoIndex(state.queueVideoIndex += 1);
	await setStateIsPaused(false);
	await startPlayer(state.connection, state.audioPlayer, state.queue, state.queueVideoIndex);

	if (interaction) await videoIsSkippedMessage(interaction);
}

async function pause(interaction) {
	if (!await checkUserIsInVoiceChannel(interaction)) return;
	if (state.isPaused === true) {
		if (await unpausedAndCheckIsSuccessful({ interaction: interaction, audioPlayer: state.audioPlayer })) await setStateIsPaused(false);
		return;
	}
	if (await pausedAndCheckIsSuccessful({ interaction: interaction, audioPlayer: state.audioPlayer })) await setStateIsPaused(true);
}

async function stop(interaction = null) {
	if (interaction) {
		if (!await checkIsPlayingAndIsConnection(interaction, state.audioPlayer, state.connection)) return;
		if (!await checkUserIsInVoiceChannel(interaction)) return;
		if (!await stopAudioPlayerAndCheckIsSuccessful({ interaction: interaction, audioPlayer: state.audioPlayer, queue: state.queue })) return;
	}
	if (state.isPaused) await unpausedAndCheckIsSuccessful({ audioPlayer: state.audioPlayer });
	await setStateIsPaused(false);

	setStateQueue([]);
	setStateQueueVideoIndex(0);
	destroyConnectionIfExist(state.connection);
	logger.verbose(`[Utils] Воспроизведение медиа отменено`);

	if (!interaction) return;
	await sendSuccessfullyStoppedMessage(interaction);
}


async function onIdleAudioPlayer(audioPlayer) {
	await audioPlayer.on('idle', async () => {
		if (state.queueVideoIndex < state.queue.length - 1) {
			await skip();
			return;
		}
		// здесь прописано обнуление очереди, поскольку в ней остаётся последний трек,
		// idle срабатывает после его окончания, а условие обходит вызов skip() с одним треком
		await setStateQueue([]);
		logger.silly('[Utils] Очередь закончилась');
		stop();
	});
}


async function startPlayer(connection, audioPlayer, queue, queueVideoIndex) {
	await subscribeAudioPlayer(connection, audioPlayer);

	const stream = await createStream(queue, queueVideoIndex);
	const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });

	await audioPlayer.play(resource);
	logger.verbose(`[Utils] Начато воспроизведение медиа ${queueVideoIndex + 1}/${queue.length} – ${queue[queueVideoIndex]}`);
}


async function setStateQueue(newQueue) {
	state.queue = newQueue;
}

async function setStateConnection(newConnection) {
	state.connection = newConnection;
}

async function setStateQueueVideoIndex(newQueueVideoIndex) {
	state.queueVideoIndex = newQueueVideoIndex;
}
async function setStateIsPaused(newIsPaused) {
	state.isPaused = newIsPaused;
}


async function addMediaToQueue(queue, url) {
	return queue = [...queue, url];
}

async function sendLastVideoCannotBeSkippedWarnMessage(interaction) {
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Это видео последнее в очереди, дальше скипать некуда)`,
			type: 'warn',
		}),
		ephemeral: true,
	});
}

async function sendCannotUnpausedWarnMessage(interaction) {
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Не удалось снять воспроизведение медиа с паузы`,
			type: 'warn',
		}),
		ephemeral: true,
	});
}

async function sendCannotPausedWarnMessage(interaction) {
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Не удалось поставить на паузу воспроизведение медиа`,
			type: 'warn',
		}),
		ephemeral: true,
	});
}

async function videoIsSkippedMessage(interaction) {
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Видео скипнуто`,
		}),
		ephemeral: true,
	});
}

async function sendPausedMessage(interaction) {
	await interaction.reply({
		embeds: simpleEmbedBuilder({
			description: `Поставлено на паузу`,
		}),
		ephemeral: true,
	});
}

async function sendUnpausedMessage(interaction) {
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Снято с паузы`,
		}),
		ephemeral: true,
	});
}

async function sendUserIsNotInVoiceChannelWarnMessage(interaction) {
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Вы должны находиться в голосовом канале, чтобы сделать это`,
			type: 'warn',
		}),
		ephemeral: true,
	});
}

async function sendWrongLinkWarnMessage(interaction) {
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Ссылка некорректна, подходят только ссылки с YouTube`,
			type: 'warn',
		}),
		ephemeral: true,
	});
}

async function sendVideoUnavailableMessage(interaction) {
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Видео больше недоступно`,
			type: 'warn',
		}),
		ephemeral: true,
	});
}

async function sendLinkCheckUnknownErrorWarnMessage(interaction) {
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `При проверке ссылки что-то пошло не так`,
			type: 'error',
		}),
		ephemeral: true,
	});
}

async function sendSuccessfullyStoppedMessage(interaction) {
	await interaction.reply({
		embeds: simpleEmbedBuilder({
			description: `Воспроизведение остановлено`,
			type: 'success',
		}),
		ephemeral: true,
	});
}

async function sendNothingPlaysMessage(interaction) {
	await interaction.reply({
		embeds: simpleEmbedBuilder({
			description: `ничего не воспроизводится`,
			type: 'warn',
		}),
		ephemeral: true,
	});
}

async function sendCannotStopPlayingWarnMessage(interaction) {
	await interaction.reply({
		embeds: simpleEmbedBuilder({
			description: `Не удалось остановить воспроизведение медиа`,
			type: 'warn',
		}),
		ephemeral: true,
	});
}

async function sendAddedToQueueMessage(interaction, url) {
	await interaction.reply({ content: `> Добавлено в очередь – ${url}` });
}

async function sendStartedPlayingMessage(interaction, url) {
	await interaction.reply({ content: `> Начато воспроизведение – ${url}` });
}


async function createConnection({ channelId, guildId, adapterCreator }) {
	return joinVoiceChannel({
		channelId: channelId,
		guildId: guildId,
		adapterCreator: adapterCreator,
	});
}

async function checkIsVideoLastInQueue(interaction, queue, queueVideoIndex) {
	if (queueVideoIndex >= queue.length - 1 && interaction) {
		sendLastVideoCannotBeSkippedWarnMessage(interaction);
		return true;
	} return false;
}

async function checkQueueIsEmptyAndSendStartingPlayerMessages(queue, interaction, url) {
	if (queue.length > 1) {
		await sendAddedToQueueMessage(interaction, url);
		return false;
	}
	await sendStartedPlayingMessage(interaction, url);
	return true;
}

async function checkUserIsInVoiceChannel(interaction) {
	if (interaction.member.voice.channel === null || interaction.member.voice.channel === undefined) {
		await sendUserIsNotInVoiceChannelWarnMessage(interaction);
		return false;
	} return true;
}

async function checkVideoIsUnavailableAndSendMessages(interaction, url) {
	const response = await checkIsPossibleToGetVideoBasicInfo(url);
	if (response.success) return false;

	if (!response.success) {
		if (response.body.message.includes('Video unavailable')) {
			logger.verbose(`Медиа недоступно и не может быть воспроизведено`);
			await sendVideoUnavailableMessage(interaction);
			return true;
		}
		logger.error(`Неизвестная ошибка при получении информации о видео ${response.body}`);
		await sendLinkCheckUnknownErrorWarnMessage(interaction);
		return true;
	}
}

async function checkIsPossibleToGetVideoBasicInfo(url) {
	try {
		const videoBasicInfo = await ytdl.getBasicInfo(url);
		return { success: true, body: videoBasicInfo };
	}
	catch (error) {
		return { success: false, body: error };
	}
}

async function checkUrlIsValid(interaction, url) {
	if (!ytdl.validateURL(url)) {
		await sendWrongLinkWarnMessage(interaction);
		return false;
	} return true;
}

async function checkIsPlayingAndIsConnection(interaction, audioPlayer, connection) {
	if (!audioPlayer.checkPlayable() && connection === null) {
		checkIsInteractionExistAndSendMessage(interaction);
		return false;
	} return true;
}

async function checkIsInteractionExistAndSendMessage(interaction) {
	if (interaction) await sendNothingPlaysMessage(interaction);
}


async function subscribeAudioPlayer(connection, audioPlayer) {
	await connection.subscribe(audioPlayer);
}

async function createStream(queue, queueVideoIndex) {
	return ytdl(queue[queueVideoIndex], {
		filter: 'audioonly',
		fmt: 'mp3',
		highWaterMark: 1 << 30,
		liveBuffer: 20000,
		dlChunkSize: 4096,
		bitrate: 128,
		quality: 'lowestaudio',
	});
}

async function createNewOrUseExistingConnection({ connection, voiceChannelId, guildId, adapterCreator }) {
	if (!connection) {
		return await createConnection({
			channelId: voiceChannelId,
			guildId: guildId,
			adapterCreator: adapterCreator,
		});
	} return connection;
}

async function stopAudioPlayerAndCheckIsSuccessful({ interaction = null, audioPlayer, queue }) {
	if ((audioPlayer.stop() !== true) && queue.length !== 0) {
		logger.silly(`[Utils] Не удалось остановить воспроизведение медиа audioPlayer`);
		if (interaction === null) return false;
		await sendCannotStopPlayingWarnMessage(interaction);
		return false;
	} return true;
}

async function destroyConnectionIfExist(connection) {
	if (connection && !connection.destroyed) await connection.destroy();
	await setStateConnection(null);
}

async function unpausedAndCheckIsSuccessful({ interaction = null, audioPlayer }) {
	if (audioPlayer.unpause() !== true) {
		logger.silly(`[Utils] Не удалось снять с паузы воспроизведение медиа audioPlayer`);
		if (interaction) sendCannotUnpausedWarnMessage(interaction);
		return false;
	}
	if (interaction) sendUnpausedMessage(interaction);
	logger.verbose(`[Utils] Медиа плейер снят с паузы`);
	return true;
}

async function pausedAndCheckIsSuccessful({ interaction = null, audioPlayer }) {
	if (audioPlayer.pause() !== true) {
		logger.silly(`[Utils] Не удалось поставить на паузу воспроизведение медиа audioPlayer`);
		if (interaction) sendCannotPausedWarnMessage(interaction);
		return false;
	}
	if (interaction) sendPausedMessage(interaction);
	logger.verbose(`[Utils] Медиа на паузе`);
	return true;
}


async function checkQueueStatus() {
	logger.silly('checkQueueStatus');
}


module.exports = {
	play,
	stop,
	pause,
	skip,
	checkQueueStatus,
};