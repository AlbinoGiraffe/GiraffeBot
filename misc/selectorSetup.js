const config = require('../config.json');
const Sequelize = require('sequelize');
const { Client, Intents } = require('discord.js');

const client = new Client({
	intents: [Intents.FLAGS.GUILDS],
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

db.majors.sync();

client.once('ready', (c) => {
	c.guilds.fetch(config.guildId).then((g) => {
		console.log(`Fetched ${g.name}`);
		g.roles.fetch().then((r) => {
			console.log('roles fetched');
			const dup = findDuplicates(r);
			if (dup) {
				console.log(dup);
			} else {
				console.log('No duplicates :)');
			}

			updateRoles(g);
		});
	});
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
			g.roles.fetch().then((r) => {
				const cd = r.find(
					(x) => x.name.toLowerCase() == roleName.toLowerCase(),
				);

				if (!cd) {
					g.roles
						.create({ name: roleName })
						.then((rc) => console.log(`Created ${rc.name}`))
						.catch(console.error);
				} else {
					cd.edit({ name: roleName });
					console.log(`${roleName} already in server, edited`);
				}
			});
		});
		console.log('done');
	});
}
client.login(config.token);
