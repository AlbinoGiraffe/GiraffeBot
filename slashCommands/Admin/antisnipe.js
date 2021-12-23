const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('as')
		.setDescription('Cancel a snipe')
		.setDefaultPermission(false),
	run: (client, interaction) => {
		return;
	},
};
