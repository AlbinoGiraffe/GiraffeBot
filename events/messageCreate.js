const botUtils = require('../botUtils');
const config = require('../config.json');

module.exports = (client, message) => {
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
	} else {
		console.log(
			`[${date}]: ${message.author.tag} in #${
				message.channel.name
			}: ${botUtils.truncate(message.content)}`,
		);
	}

	if (message.content == 'prefix') {
		client.db.GuildConfig.findOne({
			where: { guildId: message.guild.id },
		})
			.then((token) =>
				message
					.reply(`My prefix on this server is: ${token.prefix}`)
					.catch(console.error),
			)
			.catch(console.error);
	}
	// bot mentioned
	if (message.mentions.has(client.user)) {
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

	// Command processing
	client.db.GuildConfig.findOne({
		where: { guildId: message.guild.id },
	})
		.then((token) => {
			if (token.prefix) {
				const currentPrefix = token.prefix;
				if (
					!message.content.startsWith(`${currentPrefix}`) ||
					!message.content.startsWith(`${config.prefix}`)
				) {
					return;
				}

				const args = message.content
					.slice(currentPrefix.length)
					.trim()
					.split(/ +/g);
				const command = args.shift().toLowerCase();
				const cmd = client.commands.get(command);

				if (!cmd) return;
				cmd.run(client, message, args);
			}
			return;
		})
		.catch(console.error);
};
