const { SlashCommandBuilder } = require('@discordjs/builders');
const botUtils = require('../../botUtils');
// const botUtils = require('../../botUtils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ignore')
		.setDescription('ignore this channel for logging')
		.addSubcommand((list) =>
			list.setName('list').setDescription('get currently ignored channels'),
		)
		.addSubcommand((add) =>
			add.setName('add').setDescription('ignore channel for logging'),
		)
		.addSubcommand((remove) =>
			remove.setName('remove').setDescription('reenable logging'),
		)
		.addSubcommand((clear) =>
			clear.setName('clear').setDescription('clear ignored channels'),
		)
		.setDefaultPermission(false),
	run: async (client, interaction) => {
		if (!interaction.guild) {
			return interaction.reply("Command can't run in DM!");
		}

		await interaction.deferReply({ ephemeral: true });

		const cmd = interaction.options.getSubcommand();

		const config = await client.db.GuildConfig.findOne({
			where: { guildId: interaction.guild.id },
		});

		if (!config) {
			return interaction.editReply('Error setting ignores!');
		}

		let channels = [];
		if (config.ignoredChannels) {
			channels = JSON.parse(config.ignoredChannels);
		}

		if (cmd == 'list') {
			let msg = 'Logging disabled for:\n';

			if (channels.length == 0) {
				return interaction.editReply('No ignored channels in this server');
			}

			for (const cid of channels) {
				const guildChannel = await interaction.guild.channels.fetch(cid);
				msg = msg + `${guildChannel}\n`;
			}
			interaction.editReply(msg);
		}

		if (cmd == 'add') {
			if (!channels.includes(interaction.channel.id)) {
				channels.push(interaction.channel.id);

				client.db.GuildConfig.update(
					{ ignoredChannels: JSON.stringify(channels) },
					{ where: { guildId: interaction.guild.id } },
				).then(await updateIgnoreList(client, interaction.channel));

				console.log(`Ignored #${interaction.channel.name} for logging.`);
				interaction.editReply(`Ignored ${interaction.channel} for logging.`);
			} else {
				interaction.editReply('Channel already ignored!');
			}
		}

		if (cmd == 'remove') {
			if (channels.includes(interaction.channel.id)) {
				channels.pop(interaction.channel.id);
				console.log(`Reset loggging for #${interaction.channel.name}`);
				interaction.editReply(`Logging re-enabled for ${interaction.channel}`);
			} else {
				interaction.editReply("This channel isn't ignored!");
			}
		}

		if (cmd == 'clear') {
			channels = [];
			client.db.GuildConfig.update(
				{ ignoredChannels: JSON.stringify(channels) },
				{ where: { guildId: interaction.guild.id } },
			).then(await updateIgnoreList(client, interaction.channel));
			interaction.editReply(
				`Cleared ignored channels for **${interaction.guild.name}**`,
			);
			console.log(`Reset loggging for ${interaction.guild.name}`);
		}
	},
};

async function updateIgnoreList(client, channel) {
	// update ignore list
	client.ignoreList = await botUtils.getIgnoreList(client);
	console.log(`Log ignores updated for ${channel.name}`);
}
