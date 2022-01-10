const { SlashCommandBuilder } = require('@discordjs/builders');
const botUtils = require('../../botUtils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ignore')
		.setDescription('ignore this channel for logging')
		.addBooleanOption((option) =>
			option.setName('reset').setDescription('set true to re-enable logging'),
		)
		.setDefaultPermission(false),
	run: async (client, interaction) => {
		const op = interaction.options.getBoolean('reset');
		client.db.GlobalConfig.findOne({
			where: { guildId: interaction.guild.id },
		}).then((exists) => {
			let channels = [];
			if (!exists) {
				if (!op) {
					channels.push(interaction.channel.id);

					client.db.GlobalConfig.create({
						guildId: interaction.guild.id,
						ignoredChannels: JSON.stringify(channels),
					});
				}
			} else {
				channels = JSON.parse(exists.ignoredChannels);
				if (!op) {
					if (!channels.includes(interaction.channel.id)) {
						channels.push(interaction.channel.id);
					}
					console.log(`Ignored #${interaction.channel.name}`);
				} else {
					channels.pop(interaction.guild.id);
					console.log(`Reset loggging for #${interaction.channel.name}`);
				}

				client.db.GlobalConfig.update(
					{
						ignoredChannels: JSON.stringify(channels),
					},
					{ where: { guildId: interaction.guild.id } },
				);
			}
			updateIgnoreList(client, interaction.channel);
			interaction
				.reply({
					content: `${interaction.channel} logging updated.`,
					ephemeral: true,
				})
				.catch(console.error);
		});
	},
};

async function updateIgnoreList(client, channel) {
	// update ignore list
	client.ignoreList = await botUtils.getIgnoreList(client);
	console.log(`Log ignores updated for ${channel.name}`);
}
