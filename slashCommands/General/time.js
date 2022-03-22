const { SlashCommandBuilder } = require('@discordjs/builders');
const color = require('colors/safe');
const botUtils = require('../../botUtils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription("Get bot's local time"),
	run: (client, interaction) => {
		interaction
			.reply(`It's \`${botUtils.dateTime()}\``)
			.catch((e) => console.log(color.red(e)));
		return;
	},
};
