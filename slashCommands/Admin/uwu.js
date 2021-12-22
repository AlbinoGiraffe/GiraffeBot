const { SlashCommandBuilder } = require('@discordjs/builders');
const Uwuifier = require('uwuifier');
const uwu = new Uwuifier();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uwu')
		.setDescription('Uwuify text')
		.setDefaultPermission(false)
		.addStringOption((option) =>
			option.setName('text').setDescription('Text to uwuify').setRequired(true),
		),
	run: async (client, interaction) => {
		const msg = interaction.options.getString('text');
		interaction.channel.send(uwu.uwuifySentence(msg));
		interaction.reply({ content: 'uwuified!', ephemeral: true });
	},
};
