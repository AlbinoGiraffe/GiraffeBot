const { SlashCommandBuilder } = require('@discordjs/builders');
const BotUtils = require('../../botUtils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clear bot messages (last 250)')
		.setDefaultPermission(false),
	run: async (client, interaction) => {
		await interaction.deferReply({ ephemeral: true });
		await BotUtils.fetchMore(interaction.channel)
			.then((messages) => {
				messages.forEach((msg) => {
					if (msg.author == client.user) {
						msg.delete().catch((e) => console.log(e));
					}
					interaction.editReply('Deleted bot messages');
				});
			})
			.catch((e) => {
				console.log(e);
			});
	},
};
