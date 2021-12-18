const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDescription('Bulk delete messages'),
	async execute(interaction) {
		return;
	},
};
