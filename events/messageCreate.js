const botUtils = require('../botUtils');
const config = require('../config.json');

module.exports = async (client, message) => {
	if (message.author.bot) return;
	if (message.channel.partial) message.channel.fetch();
	if (message.partial) message.fetch();

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
			const toEmphasize = await message.channel.messages.fetch(
				message.reference.messageId,
			);
			message.reply(`*${toEmphasize.content}*`);
		} else {
			message.channel.messages.fetch({ limit: 2 }).then((m) => {
				message.channel.send(`*${m.last().content}*`);
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
		return;
	}

	// bot mentioned or dm
	if (message.mentions.has(client.user) || !message.guild) {
		const cbquery = message.cleanContent
			.replaceAll('@', '')
			.replaceAll('\u200B', '')
			.replaceAll(client.user.username, '');

		client.clev
			.query(cbquery)
			.then((response) => {
				message.reply(response.output);
			})
			.catch(console.error);
	}
};
