const { SlashCommandBuilder } = require('@discordjs/builders');
const color = require('colors/safe');

module.exports = {
	data: new SlashCommandBuilder().setName('').setDescription(''),
	run: (client, interaction) => {
		interaction.reply('done').catch((e) => console.log(color.red(e)));
		return;
	},
};
