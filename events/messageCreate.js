const color = require('colors/safe');
const botUtils = require('../botUtils');
const config = require('../config.json');

// counting variables
let lastNumber = null;
let TOTAL_COUNTS = {};
let HIGHEST_COUNTER_ROLE = null;
let LAST_COUNTER_ROLE = null;
let COUNTING_MUTE_ROLE = null;
let lastMessageTimeout = null;

// counting members
let highestCounter = null;
let lastMember = null;

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
			const msg = await message.channel.messages.fetch(
				message.reference.messageId,
			);
			const toEmphasize = botUtils.cleanInput(msg.content);
			message.reply(`*${toEmphasize}*`).catch(console.error);
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
	const count = await client.db.Count.findOne({
		where: { guildId: message.guild.id },
	});

	if (!count) return;
	if (!count.channelId) return;
	if (!(message.channel.id == count.channelId)) return;

	lastMember = await message.guild.members.fetch(count.lastMember);
	highestCounter = await message.guild.members.fetch(count.highestCounter);

	if (!highestCounter || highestCounter.size > 0) {
		highestCounter = null;
	}
	if (!lastMember || lastMember.size > 0) {
		lastMember = null;
	}

	lastNumber = parseInt(count.lastNumber);
	TOTAL_COUNTS = JSON.parse(count.totalCount);
	HIGHEST_COUNTER_ROLE = await message.guild.roles.fetch(
		count.highestCounterRole,
	);
	LAST_COUNTER_ROLE = await message.guild.roles.fetch(count.lastCounterRole);
	COUNTING_MUTE_ROLE = await message.guild.roles.fetch(count.countingMute);

	const re = /^([1-9]\d*)/;
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

	if (lastNumber !== null && num !== (parseInt(lastNumber) + 1).toString()) {
		message.delete();
		return;
	}

	if (lastMember === message.member) {
		message.delete();
		return;
	}

	await updateNumber(
		lastNumber ? lastNumber + 1 : parseInt(num, 10),
		message.member,
		message,
	);

	console.log(message.member.id);
	// Increase counter for user
	if (!TOTAL_COUNTS[message.member.id]) {
		TOTAL_COUNTS[message.member.id] = 0;
	}
	TOTAL_COUNTS[message.member.id]++;

	console.log(
		`Count for ${message.member.name} - ${TOTAL_COUNTS[message.member.id]}`,
	);

	// Change role holder if needed
	if (highestCounter) {
		if (TOTAL_COUNTS[message.member.id] > TOTAL_COUNTS[highestCounter.id]) {
			await highestCounter.roles
				.remove(HIGHEST_COUNTER_ROLE)
				.catch(console.error);
			highestCounter = message.member;
		}
	} else {
		highestCounter = message.member;
	}
	await highestCounter.roles.add(HIGHEST_COUNTER_ROLE).catch(console.error);

	// Update role name if needed
	await updateHighestCounterRole();

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

	updateDB(client, message.guild);
}

async function updateNumber(num, member, msg) {
	lastNumber = parseInt(num, 10);
	lastMember = member;
	if (lastNumber % 100 === 0) {
		await msg.channel.setName('counting-' + lastNumber);
	}
}

// let currentlySaving = false;
function updateDB(client, guild) {
	client.db.Count.update(
		{
			highestCounter: highestCounter.id,
			totalCounts: JSON.stringify(TOTAL_COUNTS),
			lastNumber: lastNumber,
			lastMember: lastMember.id,
		},
		{ where: { guildId: guild.id } },
	);
}

async function updateHighestCounterRole() {
	const highestCount = TOTAL_COUNTS[highestCounter.id];
	if (highestCount % 100 === 0) {
		await HIGHEST_COUNTER_ROLE.setName(
			`Highest Counter (${(highestCount / 1000).toFixed(1)}k)`,
		);
	}
}

// async function reactDeleteMute(msg, length = 0, emojis = []) {
// 	LAST_FIVE_MESSAGES[lastFiveIndex++] = msg;
// 	lastFiveIndex %= 5;

// 	for (let i = 0; i < emojis.length; i++) {
// 		setTimeout(() => {
// 			msg
// 				.react(emojis[i])
// 				.catch((err) =>
// 					console.error('Error sending reactDeleteMute reactions', err),
// 				);
// 		}, i * 1200);
// 	}

// 	setTimeout(() => {
// 		if (!msg.deleted) msg.delete().catch((err) => console.error(err));
// 	}, Math.max(500, emojis.length * 1200));

// 	if (length) {
// 		await msg.member.roles.add(COUNTING_MUTE_ROLE);
// 		setTimeout(() => {
// 			msg.member.roles
// 				.remove(COUNTING_MUTE_ROLE)
// 				.catch((err) =>
// 					console.error('Error removing counting mute role', err),
// 				);
// 		}, length);
// 	}
// }
