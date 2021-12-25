const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setstarboard')
		.setDescription('Set starboard channel')
		.addBooleanOption((option) =>
			option
				.setName('remove')
				.setDescription('remove this channel as a selector channel.'),
		)
		.setDefaultPermission(false),
	run: (client, interaction) => {
		const op = interaction.options.getBoolean('remove');

		let newId;
		if (op) {
			newId = null;
		} else {
			newId = interaction.channel.id;
		}

		client.db.GuildConfig.update(
			{
				starBoardChannelId: newId,
			},
			{ where: { guildId: interaction.guild.id } },
		)
			.then(() =>
				interaction
					.reply({
						content: `Starboard channel updated.`,
						ephemeral: true,
					})
					.catch(console.error),
			)
			.catch(() =>
				interaction.reply({
					content: `Error updating starboard channel!`,
					ephemeral: true,
				}),
			);
	},
};
