const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const color = require('colors/safe');
const botUtils = require('../botUtils');
const config = require('../config.json');
const fs = require('fs');

const adminPermissions = [
	{
		id: config.adminId,
		type: 'USER',
		permission: true,
	},
];

const rest = new REST({ version: '9' }).setToken(config.token);

module.exports = async (client) => {
	client.user.setPresence({
		activities: [{ name: 'GIRAFFEBOT RELEASE 1.0', type: 'PLAYING' }],
	});

	if (!client.application?.owner) client.application?.fetch();

	client.ignoreList = await botUtils.getIgnoreList(client);

	await setup(client);

	console.log(
		color.yellow(
			`Set commands/permissions/config for ${client.guilds.cache.size} guilds`,
		),
	);

	const stop = Date.now();
	console.log(
		color.green(
			`Ready! Logged in as ${client.user.tag} in ${
				(stop - client.startupTime) / 1000
			}s`,
		),
	);
};

async function setup(client) {
	for (const guild of client.guilds.cache.map((g) => g)) {
		// update guild config in database
		const token = await client.db.GuildConfig.findOne({
			where: { guildId: guild.id },
		});

		if (!token) {
			await client.db.GuildConfig.create({
				guildName: guild.name,
				guildId: guild.id,
				prefix: config.prefix,
				adminRoles: '',
				modRoles: '',
				ownerId: config.adminId,
			});
		}

		// update permissions
		await guild.commands
			.fetch()
			.then((guildCommands) => {
				if (guildCommands) {
					guildCommands.forEach((c) => {
						if (client.adminSlashCommands.includes(c.name)) {
							// edit permissions here
							c.permissions.add({ permissions: adminPermissions });
						}
					});
				}
			})
			.catch(console.error);

		guild.commands.set(client.slash).catch((e) => console.log(e));

		// Clear counting mute users
		await guild.members.fetch();
		client.db.Count.findOne({ where: { guildId: guild.id } }).then((t) => {
			if (!t) return;
			if (!t.channelId || !t.countingMute) return;

			guild.channels.fetch(t.channelId).then((c) => {
				c.messages.fetch({ limit: 1 }).then((m) => {
					const msg = m.first();
					const numMatch = msg.content.match(/^([1-9]\d*)/);

					if (numMatch && parseInt(numMatch[1]) != t.lastNumber) {
						console.log(
							`Last number updated for ${guild.name} [${t.lastNumber} => ${numMatch[1]}]`,
						);
						client.db.Count.update(
							{ lastNumber: numMatch[1], lastMember: msg.author.id },
							{ where: { guildId: guild.id } },
						);
					}
				});
			});

			// clear members with counting mute role
			guild.roles.fetch(t.countingMute).then((r) => {
				r.members.forEach((m) => {
					m.roles.remove(r);
				});
			});
		});
	}
	console.log(color.yellow('Removed counting mute roles'));

	// set global commands if enabled
	if (config.globalCommands) {
		try {
			console.log('Setting global commands.');

			await rest.put(Routes.applicationCommands(client.user.id), {
				body: client.slash,
			});

			console.log('Successfully set global commands.');
		} catch (error) {
			console.error(error);
		}

		config.globalCommands = false;
		fs.writeFile(
			'../config.json',
			JSON.stringify(config),
			function writeJSON(err) {
				if (err) return console.log(err);
				console.log('config updated');
			},
		);
	}
}
