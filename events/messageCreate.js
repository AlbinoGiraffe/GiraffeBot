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
	if (!message.content.startsWith(`${config.prefix}`)) return;

	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	const cmd = client.commands.get(command);

	if (!cmd) return;
	cmd.run(client, message, args);
};
