const prefix = require('../config.json');

module.exports = {
	name: 'messageCreate',
	execute(message, client) {
		console.log(
			`${message.author.tag} in #${message.channel.name}: ${message.content}`,
		);

		if (message.author == client) return;

		// Command processing
		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();
		const cmd = client.commands.get(command);
		if (!cmd) return;
		cmd.run(client, message, args);
	},
};
