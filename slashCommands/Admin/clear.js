const { SlashCommandBuilder } = require('@discordjs/builders');
const BotUtils = require('../../botUtils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clear bot messages (default = last 250)')
		.setDefaultPermission(false)
		.addIntegerOption((option) =>
			option.setName('num').setDescription('Number of bot messages to clear'),
		),
	run: async (client, interaction) => {
		await interaction.deferReply({ ephemeral: true }).catch();
		let num = interaction.options.getInteger('num');
		if (num <= 1 || num > 999) {
			num = 250;
		}

		BotUtils.fetchMore(interaction.channel, num)
			.then((messages) => {
				messages.forEach((msg) => {
					if (msg.author == client.user) {
						msg.delete().catch((e) => console.log(e));
					}
					interaction.editReply(`Deleted ${num} bot messages`).catch();
				});
			})
			.catch();
	},
};
