const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder().setName('uwu').setDescription('Uwuify text'),
	async execute(interaction) {
		return;
	},
};
