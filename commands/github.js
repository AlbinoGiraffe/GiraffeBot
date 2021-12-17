const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('github')
		.setDescription('Get my github link!'),
	async execute(interaction) {
		await interaction.reply('https://github.com/AlbinoGiraffe/GiraffeBot');
	},
};
