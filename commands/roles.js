const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Role management'),
	async execute(interaction) {
		return;
	},
};
