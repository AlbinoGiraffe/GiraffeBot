// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

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
client.slashCommands = new Collection();

const slashCommandFiles = fs
	.readdirSync('./commands/slash')
	.filter((file) => file.endsWith('.js'));

for (const file of slashCommandFiles) {
	const command = require(`./commands/slash/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	console.log(`Loading ${file}`);
	client.slashCommands.set(command.data.name, command);
}

// register and read event handlers
const eventFiles = fs
	.readdirSync('./events')
	.filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	try {
		console.log(`Loading ${file}`);
		const event = require(`./events/${file}`);
		const eventName = file.split('.')[0];
		client.on(eventName, event.bind(null, client));
	} catch (error) {
		console.log(`Error loading ${file} - ${error}`);
	}
}

// load command files
const commandFiles = fs
	.readdirSync('./commands')
	.filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	console.log(`Loading ${command.name}`);
	client.commands.set(command.name, command);
}

// Login to Discord with your client's token
client.login(token);
