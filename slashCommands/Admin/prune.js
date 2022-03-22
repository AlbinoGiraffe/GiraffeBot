const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	moderator: true,
	data: new SlashCommandBuilder()
		.setName('prune')
		.setDescription('Bulk delete messages')
		.setDefaultPermission(false)
		.addIntegerOption((option) =>
			option
				.setName('number')
				.setDescription('Number of messages to delete (up to 99)')
				.setRequired(true),
		),
	run: async (client, interaction) => {
		await interaction.deferReply({ ephemeral: true });

		const num = interaction.options.getInteger('number');
		if (num < 1 || num >= 100) {
			return interaction
				.editReply({ content: 'Enter a number between 1 and 99' })
				.catch(console.error);
		}

		await interaction.channel
			.bulkDelete(num, true)
			.then(() =>
				interaction
					.editReply({ content: `Done deleting ${num} messages.` })
					.catch(console.error),
			)
			.catch(() => {
				interaction.editReply({ content: 'Error pruning channel!' });
			});
	},
};
