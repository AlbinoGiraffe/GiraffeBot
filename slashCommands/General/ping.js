const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping the bot'),
	run: (client, interaction) => {
		interaction.reply(`Pong! (${client.ws.ping}ms)`).catch(console.error);
	},
};
