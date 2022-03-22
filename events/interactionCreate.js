const color = require('colors/safe');

module.exports = (client, interaction) => {
	if (!interaction.isCommand()) {
		console.log(
			color.blue(
				`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`,
			),
		);
		return;
	}

	const command = interaction.client.slashCommands.get(interaction.commandName);
	if (!command) return;
	console.log(
		color.blue(
			`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction (${interaction.commandName}).`,
		),
	);

	try {
		command.run(client, interaction);
	} catch (error) {
		console.error(error);
		interaction
			.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			})
			.catch(console.error);
	}
};
