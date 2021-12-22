const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Role management')
		.setDefaultPermission(false),
	async execute(interaction) {
		return;
	},
};
