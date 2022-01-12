const color = require('colors/safe');
const Discord = require('discord.js');
const botUtils = require('../botUtils');
const config = require('../config.json');

// counting variables
let lastMember = Discord.GuildMember;
let lastNumber = null;
let TOTAL_COUNTS = [];
let highestCounter = Discord.GuildMember;
let HIGHEST_COUNTER_ROLE = null;
let LAST_COUNTER_ROLE = null;
let lastMessageTimeout = null;

module.exports = async (client, message) => {
	if (message.author.bot) return;
	if (message.channel.partial) message.channel.fetch();
	if (message.partial) message.fetch();

	await processCounter(client, message);
	// logging
	const date = message.createdAt.toLocaleDateString();
	if (!message.guild) {
		console.log(
			`[${date}]: ${message.author.tag} in DM: ${botUtils.truncate(
				message.content,
			)}`,
		);
	}

	if (!client.ignoreList.includes(message.channel.id) && message.guild) {
		console.log(
			`[${date}]: ${message.author.tag} in #${
				message.channel.name
			}: ${botUtils.truncate(message.content)}`,
		);
	}

	// emphasize - what
	if (message.content.toLowerCase() == 'what') {
		if (message.reference) {
			const toEmphasize = botUtils.cleanInput(
				await message.channel.messages.fetch(message.reference.messageId),
			);
			message.reply(`*${toEmphasize.content}*`);
		} else {
			message.channel.messages.fetch({ limit: 2 }).then((m) => {
				message.channel.send(`*${botUtils.cleanInput(m.last().content)}*`);
			});
		}
		return;
	}

	if (message.guild) {
		client.db.GuildConfig.findOne({
			where: { guildId: message.guild.id },
		})
			.then((token) => {
				if (message.content == 'prefix') {
					message
						.reply(`My prefix on this server is: ${token.prefix}`)
						.catch(console.error);
					return;
				}

				// role selector
				if (message.channel.id == token.selectorId) {
					let remove = false;
					let mquery = message.content;
					if (message.content.startsWith('rm')) {
						remove = true;
						mquery = message.content.replace('rm ', '');
					}
					client.db.Majors.findOne({
						where: { code: mquery.toUpperCase() },
					}).then((major) => {
						if (major) {
							message.guild.roles.fetch();
							const role = message.guild.roles.cache.find(
								(r) => r.name == major.major,
							);

							if (!remove) {
								message.member.roles.add(role).catch(console.error);
								message.author
									.createDM()
									.then((m) => m.send(`Gave you the \`${role.name}\` role!`))
									.catch(console.error);
								console.log(`Gave ${message.author.tag} '${role.name}'`);
							} else {
								message.member.roles.remove(role).catch(console.error);
								message.author
									.createDM()
									.then((m) => m.send(`Removed the \`${role.name}\` role!`))
									.catch(console.error);
								console.log(`Removed ${message.author.tag} '${role.name}'`);
							}
						} else {
							message.author
								.createDM()
								.then((m) =>
									m.send(
										`Invalid major code! Use \`!codes\` to see a list of available codes.`,
									),
								)
								.catch(console.error);
						}

						if (message.author.id != config.adminId) {
							message.delete().catch(console.error);
						}
					});
				}
			})
			.catch(console.error);
	}

	// bot mentioned or dm
	if (message.mentions.has(client.user) || !message.guild) {
		if (message.content.includes('help')) {
			return client.commands.get('help').run(client, message);
		}

		const cbquery = message.cleanContent
			.replaceAll('@', '')
			.replaceAll('’', "'")
			.replaceAll('\u200B', '')
			.replaceAll(client.user.username, '');

		client.clev
			.query(cbquery)
			.then((response) => {
				message.reply(response.output);
			})
			.catch(console.error);
		return;
	}

	// Command processing
	let gid = null;
	if (message.guild) {
		gid = message.guild.id;
	}

	const token = await client.db.GuildConfig.findOne({
		where: { guildId: gid },
	});

	let currentPrefix = config.prefix;
	if (token?.prefix) {
		currentPrefix = token.prefix;
	}

	if (message.content.startsWith(`${currentPrefix}`)) {
		const args = message.content
			.slice(currentPrefix.length)
			.trim()
			.split(/ +/g);
		const command = args.shift().toLowerCase();
		const cmd = client.commands.get(command);

		if (!cmd) return;
		cmd.run(client, message, args);
		console.log(
			color.blue(
				`${message.guild.name}: ${message.author.tag} ran a command (${cmd.name}) in #${message.channel.name}`,
			),
		);
		return;
	}

	// nice
	const re = new RegExp('420|69|4.20');
	if (re.test(message.content.replaceAll(/<@!*.*>/g, ''))) {
		message.reply('nice');
	}
};

async function processCounter(client, message) {
	return;
	const count = await client.db.Count.findOne({
		where: { guildId: message.guild.id },
	});

	if (!count) return;
	if (!count.channelId) return;
	if (!(message.channel.id == count.channelId)) return;

	TOTAL_COUNTS = JSON.parse(count.totalCounts);
	HIGHEST_COUNTER_ROLE = message.guild.roles.fetch(count.highestCounter);
	LAST_COUNTER_ROLE = message.guild.roles.fetch(count.lastCounter);

	const re = new RegExp('^[1-9]\\d*');
	if (!re.test(message.content)) {
		// await reactDeleteMute(msg, 5000, ['🔢', '❓', '🚫']);
		message.delete();
		return;
	} else if (message.content.length > 60) {
		// await reactDeleteMute(msg, 5000, ['6⃣', '0⃣', '🚫']);
		message.delete();
		return;
	}

	const num = message.content.match(/^([1-9]\d*)/)[1];

	if (count.lastNumber !== null && num !== (count.lastNumber + 1).toString()) {
		message.delete();
		return;
	}

	// if (lastMember === message.member) {
	// 	message.delete();
	// 	return;
	// }

	await updateNumber(
		lastNumber ? lastNumber + 1 : parseInt(num, 10),
		message.member,
		message,
	);

	// Increase counter for user
	if (!TOTAL_COUNTS[message.member.user.id]) {
		TOTAL_COUNTS[message.member.user.id] = 0;
	}
	TOTAL_COUNTS[message.member.user.id]++;

	// Change role holder if needed
	if (
		!highestCounter ||
		TOTAL_COUNTS[message.member.user.id] > TOTAL_COUNTS[highestCounter.user.id]
	) {
		if (highestCounter) {
			await highestCounter.roles.remove(HIGHEST_COUNTER_ROLE);
		}
		highestCounter = message.member;
		await highestCounter.roles.add(HIGHEST_COUNTER_ROLE);
	}
	// Update role name if needed
	await updateHighestCounterRole();
	// Save TOTAL_COUNTS every 5 messages
	if (lastNumber % 5 === 0) saveFile(client, message.guild);

	if (lastMessageTimeout) clearTimeout(lastMessageTimeout);
	lastMessageTimeout = setTimeout(() => {
		if (
			lastMember &&
			!lastMember.roles.cache.find((r) => r.name === LAST_COUNTER_ROLE.name)
		) {
			Promise.all(
				[...LAST_COUNTER_ROLE.members.values()].map((member) =>
					member.roles.remove(LAST_COUNTER_ROLE),
				),
			)
				.catch((err) => console.error('Error removing last counter roles', err))
				.finally(() => lastMember.roles.add(LAST_COUNTER_ROLE))
				.catch((err) => console.error('Error adding last counter role', err));
		}

		lastMessageTimeout = null;
	}, 15 * 60 * 1000);
}

async function updateNumber(num, member, msg) {
	lastNumber = parseInt(num, 10);
	lastMember = member;
	if (lastNumber % 100 === 0) {
		await msg.channel.setName('counting-' + lastNumber);
	}
}

// let currentlySaving = false;
function saveFile(client, guild) {
	// if (currentlySaving) return;
	// currentlySaving = true;
	// fs.writeFile(COUNTER_FILE, JSON.stringify(TOTAL_COUNTS), () => {
	// 	currentlySaving = false;
	// });
	client.db.Count.update(
		{ totalCounts: JSON.stringify(TOTAL_COUNTS) },
		{ where: { guildId: guild.id } },
	);
}

async function updateHighestCounterRole() {
	const highestCount = TOTAL_COUNTS[highestCounter.user.id];
	if (highestCount % 100 === 0) {
		await HIGHEST_COUNTER_ROLE.setName(
			`Highest Counter (${(highestCount / 1000).toFixed(1)}k)`,
		);
	}
}

async function reactDeleteMute(msg, length = 0, emojis = []) {
	LAST_FIVE_MESSAGES[lastFiveIndex++] = msg;
	lastFiveIndex %= 5;

	for (let i = 0; i < emojis.length; i++) {
		setTimeout(() => {
			msg
				.react(emojis[i])
				.catch((err) =>
					console.error('Error sending reactDeleteMute reactions', err),
				);
		}, i * 1200);
	}

	setTimeout(() => {
		if (!msg.deleted) msg.delete().catch((err) => console.error(err));
	}, Math.max(500, emojis.length * 1200));

	if (length) {
		await msg.member.roles.add(COUNTING_MUTE_ROLE);
		setTimeout(() => {
			msg.member.roles
				.remove(COUNTING_MUTE_ROLE)
				.catch((err) =>
					console.error('Error removing counting mute role', err),
				);
		}, length);
	}
}
