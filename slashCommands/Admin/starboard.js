const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('starboard')
		.setDescription('starboard options')
		.addSubcommand((set) =>
			set
				.setName('set')
				.setDescription('set starboard channel')
				.addBooleanOption((option) =>
					option
						.setName('remove')
						.setDescription('remove this channel as a starboard channel.'),
				),
		)
		.addSubcommand((get) =>
			get.setName('get').setDescription('get starboard channel'),
		)
		.addSubcommand((stats) =>
			stats.setName('stats').setDescription('Get starboard stats'),
		)
		.setDefaultPermission(false),
	run: async (client, interaction) => {
		if (!interaction.guild) {
			return interaction.reply("Command can't run in DM!");
		}

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
			return;
		}

		if (cmd == 'get') {
			const tok = await client.db.GuildConfig.findOne({
				where: { guildId: interaction.guild.id },
			});

			if (!tok.starBoardChannelId) {
				return interaction.reply({
					content: `Starboard channel not set!`,
					ephemeral: true,
				});
			}

			const channel = await interaction.guild.channels.fetch(
				tok.starBoardChannelId,
			);

			interaction.reply({
				content: `Starboard set to ${channel}`,
				ephemeral: true,
			});
		}

		if (cmd == 'stats') {
			// const tok = await client.db.GuildConfig.findOne({
			// 	where: { guildId: interaction.guild.id },
			// });
			// if (!tok.starBoardChannelId) {
			// 	return interaction.reply({
			// 		content: `Starboard channel not set!`,
			// 		ephemeral: true,
			// 	});
			// }
			// const channel = await interaction.guild.channels.fetch(
			// 	tok.starBoardChannelId,
			// );
			// interaction.reply({
			// 	content: `Starboard set to ${channel}`,
			// 	ephemeral: true,
			// });
		}
	},
};
