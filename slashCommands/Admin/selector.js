const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('selector')
		.setDescription('Set selector to the current channel')
		.addSubcommand((set) =>
			set
				.setName('set')
				.setDescription('set selector channel')
				.addBooleanOption((option) =>
					option
						.setName('remove')
						.setDescription('remove this channel as a selector channel.'),
				),
		)
		.addSubcommand((get) =>
			get.setName('get').setDescription('get selector channel'),
		)
		.setDefaultPermission(false),
	run: async (client, interaction) => {
		const cmd = interaction.options.getSubcommand();

		if (cmd == 'set') {
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
		}

		if (cmd == 'get') {
			const tok = await client.db.GuildConfig.findOne({
				where: { guildId: interaction.guild.id },
			});

			if (!tok.selectorId) {
				return interaction.reply({
					content: `Selector channel not set!`,
					ephemeral: true,
				});
			}

			const channel = await interaction.guild.channels.fetch(tok.selectorId);

			interaction.reply({
				content: `Selector set to ${channel}`,
				ephemeral: true,
			});
		}
	},
};
