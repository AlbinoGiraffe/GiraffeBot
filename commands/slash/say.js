const { SlashCommandBuilder } = require('@discordjs/builders');
const BotUtils = require('../../botUtils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Make me say something')
		.addStringOption((option) =>
			option
				.setName('input')
				.setDescription('What you want me to say')
				.setRequired(true),
		),
	run: async (client, interaction) => {
		interaction.reply({ content: 'Sent', ephemeral: true });
		interaction.channel.send(
			`${BotUtils.cleanInput(interaction.options.getString('input'))}`,
		);
		return;
	},
};
