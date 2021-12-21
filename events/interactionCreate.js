module.exports = (client, interaction) => {
	console.log(
		`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`,
	);

	if (!interaction.isCommand()) return;
	const command = interaction.client.slashCommands.get(interaction.commandName);
	if (!command) return;

	try {
		command.run(client, interaction);
	} catch (error) {
		console.error(error);
		interaction.reply({
			content: 'There was an error while executing this command!',
			ephemeral: true,
		});
	}
};
