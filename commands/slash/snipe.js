const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('s')
		.setDescription('Snipe a recently deleted message'),
	async execute(interaction) {
		return;
	},
};
