const ytdl = require('ytdl-core');
const logger = require('@/utils/logger');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const simpleEmbedBuilder = require('@/utils/simpleEmbedBuilder');

const audioPlayer = createAudioPlayer();
let voiceChannel = null;
let connection = null;
let queue = [];
let queueVideoIndex = 0;
let isPaused = false;
let stream = null;
let resource = null;

// TODO

// Client.user.setPresence({
// 	activities: [{ name: `Музыка`, type: ActivityType.Watching }],
// 	status: 'Музыка',
// });


async function play(interaction, url) {
	if (interaction.member.voice.channel === null || interaction.member.voice.channel === undefined) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Вы должны находиться в голосовом канале, чтобы воспроизвести видео`,
				type: 'warn',
			}),
			ephemeral: true,
		});
		return;
	}

	if (!ytdl.validateURL(url)) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Ссылка некорректна, подходят только ссылки с YouTube`,
				type: 'warn',
			}),
			ephemeral: true,
		});
		return;
	}

	voiceChannel = interaction.member.voice.channel;
	connection = joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: interaction.guildId,
		adapterCreator: interaction.guild.voiceAdapterCreator,
	});

	if (!voiceChannel) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Вы должны находиться в голосовом канале, чтобы воспроизвести видео`,
				type: 'warn',
			}),
			ephemeral: true,
		});
		return;
	}

	if (queue.length > 0) {
		queue.push(url);
		logger.debug(`[Utils] Медиа добавлено в очередь (${queue.length}) ${url}`);
		await interaction.reply({ content: `> Добавлено в очередь – ${url}` });
		return;
	}

	queue.push(url);
	await startPlayer();
	await interaction.reply({ content: `> Начато воспроизведение – ${url}` });
}

async function startPlayer() {
	await connection.subscribe(audioPlayer);
	stream = ytdl(queue[queueVideoIndex], {
		filter: 'audioonly',
		fmt: 'mp3',
		highWaterMark: 1 << 30,
		liveBuffer: 20000,
		dlChunkSize: 4096,
		bitrate: 128,
		quality: 'lowestaudio',
	});
	resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
	audioPlayer.play(resource);
	logger.verbose(`[Utils] Начато воспроизведение медиа ${queueVideoIndex + 1}/${queue.length} – ${queue[queueVideoIndex]}`);
}

async function checkQueueStatus() {
	logger.silly('checkQueueStatus');
}

audioPlayer.on('idle', async () => {
	if (queueVideoIndex < queue.length - 1) {
		skip();
		return;
	}
	// здесь прописано обнуление очереди, поскольку в ней остаётся последний трек,
	// idle срабатывает после его окончания, а условие обходит вызов skip() с одним треком
	queue = [];
	logger.silly('[Utils] Очередь закончилась');
	stop();
});

async function stop(interaction = null) {
	if (!audioPlayer.checkPlayable() && connection === null) {
		if (interaction !== null) {
			await interaction.reply({
				embeds: await simpleEmbedBuilder({
					description: `ничего не воспроизводится`,
					type: 'warn',
				}),
				ephemeral: true,
			});
		}
		return;
	}

	if (interaction !== null && (interaction.member.voice.channel === null || interaction.member.voice.channel === undefined)) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Вы должны находиться в голосовом канале, чтобы отменить воспроизведение видео`,
				type: 'warn',
			}),
			ephemeral: true,
		});
		return;
	}

	if (audioPlayer.unpause() !== true) {
		logger.silly(`[Utils] Не удалось снять с паузы воспроизведение медиа audioPlayer`);
	}
	else {isPaused = false;}

	if ((audioPlayer.stop() !== true) && queue.length !== 0) {
		logger.silly(`[Utils] Не удалось остановить воспроизведение медиа audioPlayer`);
		if (interaction === null) return;
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Не удалось остановить воспроизведение медиа`,
				type: 'warn',
			}),
			ephemeral: true,
		});
		return;
	}

	queue = [];
	queueVideoIndex = 0;

	logger.verbose(`[Utils] Воспроизведение медиа отменено`);

	if ((connection !== null && connection !== undefined) && !connection.destroyed) await connection.destroy();
	connection = null;

	if (interaction === null) return;
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Воспроизведение остановлено`,
			type: 'success',
		}),
		ephemeral: true,
	});
}

async function pause(interaction) {
	if (interaction.member.voice.channel === null || interaction.member.voice.channel === undefined) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Вы должны находиться в голосовом канале, чтобы переключать паузу`,
				type: 'warn',
			}),
			ephemeral: true,
		});
		return;
	}
	if (isPaused) {
		if (audioPlayer.unpause() !== true) {
			logger.silly(`[Utils] Не удалось снять воспроизведение медиа с паузы mediaPlayer`);
			await interaction.reply({
				embeds: await simpleEmbedBuilder({
					description: `Не удалось снять воспроизведение медиа с паузы`,
					type: 'warn',
				}),
				ephemeral: true,
			});
			return;
		}
		isPaused = false;
		logger.verbose(`[Utils] Медиа плейер снят с паузы`);
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Снято с паузы`,
			}),
			ephemeral: true,
		});
		return;
	}
	if (audioPlayer.pause() !== true) {
		logger.silly(`[Utils] Не удалось поставить воспроизведение медиа на паузу mediaPlayer`);
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Не удалось поставить воспроизведение медиа на паузу`,
				type: 'warn',
			}),
			ephemeral: true,
		});
		return;
	}
	isPaused = true;
	logger.verbose(`[Utils] Медиа на паузе`);
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Поставлено на паузу`,
		}),
		ephemeral: true,
	});
}

async function skip(interaction = null) {
	if (interaction !== null && (interaction.member.voice.channel === null || interaction.member.voice.channel === undefined)) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Вы должны находиться в голосовом канале, чтобы скипать видео`,
				type: 'warn',
			}),
			ephemeral: true,
		});
		return;
	}
	if (queueVideoIndex >= queue.length - 1 && interaction !== null && interaction !== undefined) {
		await interaction.reply({
			embeds: await simpleEmbedBuilder({
				description: `Это видео последнее в очереди, дальше скипать некуда)`,
				type: 'warn',
			}),
			ephemeral: true,
		});
		return;
	}
	queueVideoIndex++;
	if (audioPlayer.checkPlayable()) stop();
	await startPlayer();
	if (interaction === null || interaction === undefined) return;
	await interaction.reply({
		embeds: await simpleEmbedBuilder({
			description: `Видео скипнуто`,
		}),
		ephemeral: true,
	});
}

module.exports = {
	play,
	stop,
	pause,
	skip,
	checkQueueStatus,
};

