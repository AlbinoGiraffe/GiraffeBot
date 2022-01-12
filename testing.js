const config = require('./config.json');
const Sequelize = require('sequelize');
const { Client, Intents } = require('discord.js');
const fs = require('fs');

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

db.Count = db.define('CountingConfigs', {
	guildId: Sequelize.STRING,
	channelId: Sequelize.STRING,
	highestCounter: Sequelize.STRING,
	countingMute: Sequelize.STRING,
	lastCounter: Sequelize.STRING,
	totalCount: Sequelize.STRING,
	lastNumber: Sequelize.STRING,
	lastMember: Sequelize.STRING,
});

db.sync();

client.once('ready', async (c) => {
	// c.guilds.fetch(config.guildId).then((g) => {
	// 	console.log(`Fetched ${g.name}`);
	// 	g.roles.fetch().then((r) => {
	// 		console.log('roles fetched');
	// 		const dup = findDuplicates(r);
	// 		if (dup) {
	// 			console.log(dup);
	// 		} else {
	// 			console.log('No duplicates :)');
	// 		}
	// 		updateRoles(c.guild);
	// 	});
	// });

	// setInterval(getRoles, 3000);

	// console.log('update roles');
	// const g = await client.guilds.fetch('877050310181416961');
	// const t = await db.Count.findOne({ where: { guildId: g.id } });

	// if (!t) return;
	// if (!t.channelId || !t.countingMute) return;

	// await g.members.fetch();

	// const roleID = t.countingMute;
	// g.roles.fetch(roleID).then((r) => {
	// 	// console.log(r);
	// 	console.log(`Got ${r.members.size} members with that role.`);
	// });

	const count = await db.Count.findOne({
		where: { guildId: '877050310181416961' },
	});

	if (count) {
		db.Count.update(
			{
				totalCount: JSON.stringify(
					JSON.parse(fs.readFileSync('./count.json', 'utf-8')),
				),
			},
			{ where: { guildId: '877050310181416961' } },
		);
	}
});

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
