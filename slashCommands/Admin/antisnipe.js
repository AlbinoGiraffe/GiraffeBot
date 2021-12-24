const { SlashCommandBuilder } = require('@discordjs/builders');
const botUtils = require('../../botUtils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('as')
		.setDescription('Cancel a snipe')
		.setDefaultPermission(false),
	run: (client, interaction) => {
		botUtils.entryExists(client, interaction).then((token) => {
			if (token) {
				client.Snipe.destroy({ where: { channelId: interaction.channel.id } });
			}
			interaction.reply({ content: 'Snipe cancelled', ephemeral: true });
		});
	},
};
