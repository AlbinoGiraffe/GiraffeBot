const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Role management')
		.setDefaultPermission(false),
	run: async (client, interaction) => {
		return;
	},
};
