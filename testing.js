const config = require('./config.json');
const Sequelize = require('sequelize');
const { Client, Intents, MessageSelectMenu } = require('discord.js');
const fs = require('fs');
const { devNull } = require('os');

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
});

const db = new Sequelize('sqlite', config.dbUser, config.dbPass, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

db.majors = db.define('Major', {
	major: {
		type: Sequelize.STRING,
		unique: true,
	},
	code: Sequelize.STRING,
});

db.GuildConfig = db.define('GuildConfigs', {
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

db.Count = db.define('CountingConfigs', {
	guildId: Sequelize.STRING,
	channelId: Sequelize.STRING,
	highestCounter: Sequelize.STRING,
	highestCounterRole: Sequelize.STRING,
	countingMute: Sequelize.STRING,
	lastCounterRole: Sequelize.STRING,
	totalCount: Sequelize.STRING,
	lastNumber: Sequelize.STRING,
	lastMember: Sequelize.STRING,
});

db.GlobalConfig = db.define('Global', {
	guildId: { type: Sequelize.STRING, unique: true },
	ignoredChannels: { type: Sequelize.STRING },
});

db.sync();

const a = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const b = ['dp', 'an1', 'an2', 'an3', 'an4'];
let m = '';

for (const x of a) {
	m = m + `.${x}(C${x.toUpperCase()}), `;
}

for (const x of b) {
	m = m + `.${x}(${x}), `;
}
console.log(m);

client.once('ready', async (c) => {});

function findDuplicates(r) {
	let count = 0;
	const dup = [];
	r.forEach((v) => {
		r.forEach((b) => {
			if (b.name.toLowerCase() == v.name.toLowerCase()) {
				count++;
			}
		});
		if (count > 1) {
			dup.push(v.name);
			console.log(`count for ${v.name}: ${count}`);
		}
		count = 0;
	});

	if (dup.length > 0) {
		return dup;
	} else {
		return null;
	}
}

function updateRoles(g) {
	console.log('Updating roles');
	db.majors.findAll().then((ma) => {
		ma.forEach((m) => {
			const roleName = m.major;
			const cd = g?.roles.cache.find(
				(x) => x.name.toLowerCase() == roleName.toLowerCase(),
			);

			if (!cd) {
				g?.roles
					.create({ name: roleName })
					.then((r) => console.log(`Created ${r.name}`))
					.catch(console.error);
			} else {
				console.log(`${roleName} already in server`);
			}
		});
		console.log('done');
	});
}

function getRoles() {
	console.log('update roles');
	client.guilds.fetch('877050310181416961').then((g) => {
		db.Count.findOne({ where: { guildId: g.id } }).then((t) => {
			if (!t) return;
			if (!t.channelId || !t.countingMute) return;
			g.members.fetch().then(() => {
				const roleID = t.countingMute;
				g.roles.fetch(roleID).then((r) => {
					console.log(`Got ${r.size} members with that role.`);
				});
			});
		});
	});
}
client.login(config.token);
