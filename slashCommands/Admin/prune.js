const { SlashCommandBuilder } = require('@discordjs/builders');
const color = require('colors/safe');

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
		if (num <= 1 || num > 100) {
			return interaction.reply({
				content: 'Enter a number between 1 and 99',
				ephemeral: true,
			});
		}
		await interaction.channel.bulkDelete(num, true).catch((error) => {
			console.log(color.red(error));
			interaction.reply({ content: 'Error pruning channel!', ephemeral: true });
		});

		return interaction.reply({
			content: `Done deleting ${num} messages.`,
			ephemeral: true,
		});
	},
};
