const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('as')
		.setDescription('Cancel a snipe')
		.setDefaultPermission(false),
	run: async (client, interaction) => {
		if (!interaction.guild) {
			return interaction.reply("Command can't run in DM!");
		}

		const token = client.db.Snipe.findOne({
			where: { channelId: interaction.channel.id },
		});

		if (token) {
			client.db.Snipe.destroy({
				where: { channelId: interaction.channel.id },
			})
				.then(
					interaction
						.reply({ content: 'Snipe cancelled', ephemeral: true })
						.catch(console.error),
				)
				.catch(console.error);
		} else {
			interaction
				.reply({ content: 'No snipe to cancel!', ephemeral: true })
				.catch(console.error);
		}
	},
};
