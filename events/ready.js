const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const color = require('colors/safe');
const botUtils = require('../botUtils');
const config = require('../config.json');

const rest = new REST({ version: '9' }).setToken(config.token);

const packageJSON = require('../package.json');
const discordJSVersion = packageJSON.dependencies['discord.js'];

module.exports = async (client) => {
	console.log('Client ready, setting up other stuff');

	client.user.setPresence({
		activities: [
			{ name: 'Running Discord.JS ' + discordJSVersion, type: 'PLAYING' },
		],
	});

	console.log('Fetching client application');

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

		// Update counting number
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
			console.log(color.yellow('Setting global commands.'));

			await rest.put(Routes.applicationCommands(client.user.id), {
				body: client.slash,
			});

			console.log(color.yellow('Successfully set global commands.'));
		} catch (error) {
			console.error(error);
		}
	} else {
		// set guild commands for testing server
		// store testing server guild id in config
		// guild.commands.set(client.slash).catch((e) => console.log(e));
	}
}
