const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setselector')
		.setDescription('Set selector to the current channel')
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
				selectorId: newId,
			},
			{ where: { guildId: interaction.guild.id } },
		)
			.then(() =>
				interaction
					.reply({
						content: `Selector channel updated.`,
						ephemeral: true,
					})
					.catch(console.error),
			)
			.catch(() =>
				interaction.reply({
					content: `Error updating selector channel!`,
					ephemeral: true,
				}),
			);
	},
};
