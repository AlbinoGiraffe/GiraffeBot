const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
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
		const num = interaction.options.getInteger('number');
		if (num <= 1 || num >= 100) {
			return interaction
				.reply({
					content: 'Enter a number between 1 and 99',
					ephemeral: true,
				})
				.catch(console.error);
		}
		await interaction.channel
			.bulkDelete(num, true)
			.then(() =>
				interaction
					.reply({
						content: `Done deleting ${num} messages.`,
						ephemeral: true,
					})
					.catch(console.error),
			)
			.catch(() => {
				interaction.reply({
					content: 'Error pruning channel!',
					ephemeral: true,
				});
			});
	},
};
