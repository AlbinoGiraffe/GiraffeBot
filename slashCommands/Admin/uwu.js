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
		const msg = uwu.uwuifySentence(interaction.options.getString('text'));
		if (msg.length() > 2000) {
			return interaction.reply('Message too long (2000 characters)');
		}

		interaction.channel.send(msg);
		interaction
			.reply({ content: 'uwuified!', ephemeral: true })
			.catch(console.error);
	},
};
