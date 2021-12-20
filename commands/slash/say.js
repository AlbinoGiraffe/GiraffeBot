const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Make bot say something')
		.addStringOption((option) =>
			option
				.setName('input')
				.setDescription('What you want the bot to say')
				.setRequired(true),
		),
	async execute(interaction, option) {
		interaction.reply({ content: 'Sent', ephemeral: true });
		interaction.channel.send(`${option}`);
		return;
	},
};
