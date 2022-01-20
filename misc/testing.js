const config = require('../config.json');
const { Client, Intents } = require('discord.js');

const bot = new Client({ intents: [Intents.FLAGS.GUILDS] });

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const global = false;

bot.once('ready', async (client) => {
	console.log(`Logged in as ${client.user.tag}`);

	const rest = new REST({ version: '9' }).setToken(config.token);

	if (global) {
		console.log('Deleting global commands');
		await rest.get(Routes.applicationCommands(bot.user.id)).then((data) => {
			for (const command of data) {
				const deleteUrl = `${Routes.applicationCommands(bot.user.id)}/${
					command.id
				}`;
				// This takes ~1 hour to update
				client.application.commands.set([]);
				rest.delete(deleteUrl).then(console.log(`Deleted ${command.name}`));
			}
		});
	}

	console.log('Deleting guild commands');
	await client.guilds.fetch().then((guilds) => {
		guilds.forEach((g) => {
			console.log(`[${g.name}]`);
			g.commands?.set([]);
			rest
				.get(Routes.applicationGuildCommands(client.user.id, g.id))
				.then((data) => {
					for (const command of data) {
						const deleteUrl = `${Routes.applicationGuildCommands(
							client.user.id,
							g.id,
						)}/${command.id}`;
						rest
							.delete(deleteUrl)
							.then(console.log(`Deleted ${command.name}`))
							.catch(console.error);
					}
				});
		});
	});
	console.log('Done');
});

bot.login(config.token);
