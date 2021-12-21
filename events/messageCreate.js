const config = require('../config.json');

module.exports = (client, message) => {
	console.log(
		`${message.author.tag} in #${message.channel.name}: ${message.content}`,
	);
	if (message.author == client.user) return;

	// Command processing
	if (!message.content.startsWith(`${config.prefix}`)) return;
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	console.log(`Command is: >${command}<`);
	const cmd = client.commands.get(command);
	if (!cmd) return;
	console.log(`${Object.entries(message)}`);
	cmd.run(client, message, args);
};
