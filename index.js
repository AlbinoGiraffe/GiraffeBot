// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const config = require('./config.json');
const color = require('colors/safe');
const Cleverbot = require('cleverbot');
const { Sequelize } = require('sequelize');

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
	partials: ['CHANNEL'],
});

// create database
client.db = new Sequelize('sqlite', config.dbUser, config.dbPass, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

client.db.Snipe = client.db.define('Snipes', {
	channelId: {
		type: Sequelize.INTEGER,
		unique: true,
	},
	content: Sequelize.STRING,
	author: Sequelize.STRING,
	date: Sequelize.STRING,
	mid: Sequelize.INTEGER,
});

client.db.GuildConfig = client.db.define('GuildConfigs', {
	guildId: {
		type: Sequelize.INTEGER,
		unique: true,
	},
	prefix: Sequelize.STRING,
	adminRoles: Sequelize.STRING,
	modRoles: Sequelize.STRING,
	ownerId: Sequelize.INTEGER,
});

// Syncing DB
client.db.Snipe.sync({ force: true });
client.db.GuildConfig.sync();
console.log(color.yellow('Database synced'));

// initialize Cleverbot
client.clev = new Cleverbot({ key: config.cbKey });

// command and event handling
let numSlashCommands = 0;
let numAdminSlashCommands = 0;
let numCommands = 0;
let numEvents = 0;

client.commands = new Collection();
client.slashCommands = new Collection();
client.slash = [];
client.slashPerms = new Collection();
client.adminSlashCommands = [];
client.startupTime = Date.now();

// read and register slash command files
fs.readdirSync('./slashCommands').forEach((dir) => {
	if (fs.lstatSync(`./slashCommands/${dir}`).isDirectory()) {
		const slashCommands = fs
			.readdirSync(`./slashCommands/${dir}/`)
			.filter((file) => file.endsWith('.js'));
		for (const file of slashCommands) {
			const command = require(`./slashCommands/${dir}/${file}`);

			if (dir == 'Admin') {
				numAdminSlashCommands++;
				client.adminSlashCommands.push(command.data.name);
			}
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
		`Loaded ${numSlashCommands} slash commands (${numAdminSlashCommands} admin),`,
		`${numCommands} normal commands,`,
		`${numEvents} event handlers`,
	),
);

// Login to Discord with your client's token
client.login(config.token);
