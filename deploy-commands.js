const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, clientId, guildId, globalCommands } = require('./config.json');

const slashDirs = ['Admin', 'General'];
const commands = [];
const commandFiles = fs
	.readdirSync('./slashCommands')
	.filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	for (const dir of slashDirs) {
		const command = require(`./slashCommands/${dir}/${file}`);
		console.log(`Loaded ${file}`);
		commands.push(command.data.toJSON());
	}
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		if (globalCommands) {
			await rest.put(Routes.applicationCommands(clientId), { body: commands });
		} else {
			await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
				body: commands,
			});
		}
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
