const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cp')
		.setDescription('Change command prefix for this server')
		.setDefaultPermission(false)
		.addStringOption((option) =>
			option
				.setName('prefix')
				.setDescription('Character to set prefix to')
				.setRequired(true),
		),
	run: (client, interaction) => {
		const newPrefix = interaction.options.getString('prefix');
		if (newPrefix.length > 1) {
			return interaction.reply({
				content: 'Prefix must be one character!',
				ephemeral: true,
			});
		}

		client.db.GuildConfig.findOne({
			where: { guildId: interaction.guild.id },
		})
			.then((token) => {
				if (token) {
					client.db.GuildConfig.update(
						{
							prefix: newPrefix,
						},
						{ where: { guildId: interaction.guild.id } },
					);
				}
				interaction.reply(`Prefix updated to ${newPrefix}`);
			})
			.catch(console.error);
	},
};
