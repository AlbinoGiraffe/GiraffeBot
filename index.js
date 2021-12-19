// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token, prefix } = require('./config.json');
const ud = require('urban-dictionary');

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
});

// register and read slash command files
client.commands = new Collection();
const commandFiles = fs
	.readdirSync('./commands')
	.filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// register and read event handlers
const eventFiles = fs
	.readdirSync('./events')
	.filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

function urban(message) {
	ud.define(message.content.replace(`${prefix}ud `, ''))
		.then((results) => {
			message.channel.send(
				`${results[0].word}: ${results[0].definition}\nExample: ${results[0].example}`,
			);
		})
		.catch((error) => {
			console.error(`define (promise) - error ${error.message}`);
		});
}

// process message events
client.on('messageCreate', (message) => {
	if (message.author == client) return;

	console.log(
		`${message.author.tag} in #${message.channel.name}: ${message.content}`,
	);

	if (message.content.startsWith(`${prefix}ud`)) {
		urban(message);
	}
});
// Login to Discord with your client's token
client.login(token);
