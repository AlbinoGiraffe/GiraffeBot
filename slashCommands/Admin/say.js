const { SlashCommandBuilder } = require('@discordjs/builders');
const BotUtils = require('../../botUtils');

module.exports = {
	moderator: true,
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Make me say something')
		.addStringOption((option) =>
			option
				.setName('input')
				.setDescription('What you want me to say')
				.setRequired(true),
		)
		.addIntegerOption((option) =>
			option
				.setName('repeat')
				.setDescription('Number of times to repeat message (optional)'),
		)
		.setDefaultPermission(false),
	run: async (client, interaction) => {
		const num = interaction.options.getInteger('repeat');
		const msg = BotUtils.cleanInput(interaction.options.getString('input'));

		if (msg.length > 2000) {
			return interaction.reply('Message too long (2000 characters)').catch();
		}

		if (num) {
			for (let i = 0; i < num; i++) {
				setTimeout(() => interaction.channel.send(msg), 5000);
			}
		} else {
			interaction.channel.send(`${msg}`);
		}
		interaction
			.reply({ content: 'Sent', ephemeral: true })
			.catch(console.error);
		return;
	},
};
