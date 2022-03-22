const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	moderator: true,
	data: new SlashCommandBuilder()
		.setName('reply')
		.setDescription('Make bot reply to a message')
		.setDefaultPermission(false)
		.addStringOption((input) =>
			input
				.setName('id')
				.setDescription('ID of message to reply to')
				.setRequired(true),
		)
		.addStringOption((input) =>
			input.setName('text').setDescription('Reply text').setRequired(true),
		),
	admin: true,
	run: async (client, interaction) => {
		await interaction.deferReply({ ephemeral: true });
		const mid = interaction.options.getString('id');
		const rep = interaction.options.getString('text');

		interaction.channel.messages
			.fetch(mid)
			.then((message) => {
				message.reply(rep);
				interaction.editReply('Sent');
			})
			.catch((e) => {
				console.log(`Reply error: ${e}`);
				interaction.editReply('Error replying!');
			});
		return;
	},
};
