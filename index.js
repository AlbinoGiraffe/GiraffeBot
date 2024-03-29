// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const config = require('./config.json');
const color = require('colors/safe');
const { Sequelize } = require('sequelize');
const Cleverbot = require('./clev.js');

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
	partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
});

// create/load database
client.db = new Sequelize('sqlite', config.dbUser, config.dbPass, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

client.db.Snipe = client.db.define('Snipes', {
	channelId: {
		type: Sequelize.STRING,
		unique: true,
	},
	content: Sequelize.STRING,
	author: Sequelize.STRING,
	date: Sequelize.STRING,
	mid: Sequelize.STRING,
});

client.db.GuildConfig = client.db.define('GuildConfigs', {
	guildName: Sequelize.STRING,
	guildId: {
		type: Sequelize.STRING,
		unique: true,
	},
	prefix: Sequelize.STRING,
	selectorId: Sequelize.STRING,
	adminRoles: Sequelize.STRING,
	modRoles: Sequelize.STRING,
	ownerId: Sequelize.STRING,
	starBoardChannelId: Sequelize.STRING,
	assignRoles: Sequelize.STRING,
	ignoredChannels: Sequelize.STRING,

	starThreshold: {
		type: Sequelize.INTEGER,
		defaultValue: config.defaultReactionThreshold,
	},
	pinThreshold: {
		type: Sequelize.INTEGER,
		defaultValue: config.defaultReactionThreshold,
	},
});

client.db.Majors = client.db.define('Major', {
	major: {
		type: Sequelize.STRING,
		unique: true,
	},
	code: Sequelize.STRING,
});

client.db.Starboard = client.db.define('StarboardConfigs', {
	guildId: Sequelize.STRING,
	boardId: Sequelize.STRING,
	messageId: { type: Sequelize.STRING, unique: true },
});

client.db.Count = client.db.define('CountingConfigs', {
	guildId: Sequelize.STRING,
	channelId: Sequelize.STRING,
	highestCounter: Sequelize.STRING,
	highestCounterRole: Sequelize.STRING,
	countingMute: Sequelize.STRING,
	lastCounterRole: Sequelize.STRING,
	totalCount: Sequelize.STRING,
	lastNumber: { type: Sequelize.STRING, default: 0 },
	lastMember: Sequelize.STRING,
});

client.db.Cleverbot = client.db.define('Cleverbot', {
	csStr: Sequelize.STRING,
	userid: { type: Sequelize.STRING, unique: true },
});

// Syncing DB

// clear snipes at startup
client.db.Snipe.sync({ force: true });
client.db.sync();

console.log(color.yellow('Database synced'));

// initialize Cleverbot
client.clev = Cleverbot.init(config.cbKey);

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
client.modSlashCommands = [];
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

			if (command.moderator) {
				client.modSlashCommands.push(command.data.name);
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

// anti crash
process.on('unhandledRejection', (reason, p) => {
	console.log('[antiCrash] :: Unhandled Rejection/Catch');
	console.log(reason, p);
	dmOwner(client, reason, p);
});
process.on('uncaughtException', (err, origin) => {
	console.log('[antiCrash] :: Uncaught Exception/Catch');
	console.log(err, origin);
	dmOwner(client, err, origin);
});
process.on('uncaughtExceptionMonitor', (err, origin) => {
	console.log('[antiCrash] :: Uncaught Exception/Catch (MONITOR)');
	console.log(err, origin);
	dmOwner(client, err, origin);
});
process.on('multipleResolves', (type, promise, reason) => {
	console.log('[antiCrash] :: Multiple Resolves');
	console.log(type, promise, reason);
	dmOwner(client, type, promise, reason);
});

function dmOwner(bot, err, p, r = '') {
	bot.users.fetch(config.adminId).then((c) => {
		c.send(`ERROR:\n${err}\n${p}\n${r}`);
	});
}

// Login to Discord
client.login(config.token);
