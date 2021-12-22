const { DMChannel } = require('discord.js');
const config = require('../config.json');

module.exports = (client, message) => {
	if (!message.guild || !message.channel || message.author.bot) return;
	if (message.channel.partial) message.channel.fetch();
	if (message.partial) message.fetch();

	if (message.channel == DMChannel) {
		console.log(`${message.author.tag} in DMChannel: ${message.content}`);
	} else {
		console.log(
			`${message.author.tag} in #${message.channel.name}: ${message.content}`,
		);
	}

	// Command processing
	if (!message.content.startsWith(`${config.prefix}`)) return;

	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	const cmd = client.commands.get(command);

	if (!cmd) return;
	cmd.run(client, message, args);
};
