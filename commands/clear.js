const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clear bot messages'),
	async execute(interaction) {
		return;
		// await interaction.reply('https://github.com/AlbinoGiraffe/GiraffeBot');
	},
};
