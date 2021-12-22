// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const color = require('colors/safe');

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

// command and event handling

let numSlashCommands = 0;
let numCommands = 0;
let numEvents = 0;

client.commands = new Collection();
client.slashCommands = new Collection();
client.slash = [];
client.slashPerms = new Collection();
client.adminSlashCommands = [];

// read and register slash command files
fs.readdirSync('./slashCommands').forEach((dir) => {
	if (fs.lstatSync(`./slashcommands/${dir}`).isDirectory()) {
		console.log(`Loading from /${dir}...`);
		const slashCommands = fs
			.readdirSync(`./slashCommands/${dir}/`)
			.filter((file) => file.endsWith('.js'));
		for (const file of slashCommands) {
			const command = require(`./slashCommands/${dir}/${file}`);

			if (dir == 'Admin') {
				client.adminSlashCommands.push(command.data.name);
			}
			console.log(`- ${file}`);
			numSlashCommands++;
			client.slashCommands.set(command.data.name, command);
			client.slash.push(command.data.toJSON());
		}
	}
});

// register and read event handlers
const eventFiles = fs
	.readdirSync('./events')
	.filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	try {
		const event = require(`./events/${file}`);
		const eventName = file.split('.')[0];
		client.on(eventName, event.bind(null, client));
		numEvents++;
	} catch (error) {
		console.log(color.red(`Error loading ${file} - ${error}`));
	}
}

// load command files
const commandFiles = fs
	.readdirSync('./commands')
	.filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
	numCommands++;
}
console.log(
	color.yellow(
		`Loaded ${numSlashCommands} slash commands`,
		`\nLoaded ${numCommands} normal commands`,
		`\nLoaded ${numEvents} event handlers`,
	),
);

// Login to Discord with your client's token
client.login(token);
