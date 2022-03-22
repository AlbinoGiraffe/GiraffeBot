const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setreactions')
		.setDescription('Set reaction threshold for starboard/pins')
		.addStringOption((option) =>
			option
				.setName('select')
				.setDescription('update either pins or stars')
				.setRequired(true)
				.addChoice('Stars', 'star')
				.addChoice('Pins', 'pin'),
		)
		.addIntegerOption((option) =>
			option
				.setName('threshold')
				.setDescription('threshold for reactions')
				.setRequired(true),
		)
		.setDefaultPermission(false),
	run: (client, interaction) => {
		if (!interaction.guild) {
			return interaction.reply("Command can't run in DM!");
		}

		const op = interaction.options.getString('select');
		const thresh = interaction.options.getInteger('threshold');

		if (thresh < 0) {
			return interaction.reply('Threshold must be positive integer!');
		}

		if (op == 'star') {
			client.db.GuildConfig.update(
				{ starThreshold: thresh },
				{ where: { guildId: interaction.guild.id } },
			).then(() =>
				interaction
					.reply({
						content: `Star threshold updated.`,
						ephemeral: true,
					})
					.catch(console.error),
			);
		}

		if (op == 'pin') {
			client.db.GuildConfig.update(
				{ pinThreshold: thresh },
				{ where: { guildId: interaction.guild.id } },
			).then(() =>
				interaction
					.reply({
						content: `Pin threshold updated.`,
						ephemeral: true,
					})
					.catch(console.error),
			);
		}
	},
};
