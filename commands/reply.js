const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reply')
		.setDescription('Make bot reply to a message'),
	async execute(interaction) {
		return;
	},
};
