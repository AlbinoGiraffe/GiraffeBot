const { SlashCommandBuilder } = require('@discordjs/builders');
const { githubLink } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('github')
		.setDescription('Get my github link'),
	run: (client, interaction) => {
		interaction.reply(githubLink);
	},
};
