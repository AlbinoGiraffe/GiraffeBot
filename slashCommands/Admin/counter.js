const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
// const botUtils = require('../../botUtils');

// TODO: get list, force

module.exports = {
	moderator: true,
	data: new SlashCommandBuilder()
		.setName('count')
		.setDescription('Counting management')
		.addSubcommandGroup((set) =>
			set
				.setName('set')
				.setDescription('Counting settings')
				.addSubcommand((highestCounter) =>
					highestCounter
						.setName('highestcounter')
						.setDescription('Set highest counter role')
						.addRoleOption((role) =>
							role
								.setName('role')
								.setDescription('Role to add')
								.setRequired(true),
						),
				)
				.addSubcommand((countingMute) =>
					countingMute
						.setName('countingmute')
						.setDescription('Set counting mute role')
						.addRoleOption((role) =>
							role
								.setName('role')
								.setDescription('Role to add')
								.setRequired(true),
						),
				)
				.addSubcommand((lastCounter) =>
					lastCounter
						.setName('lastcounter')
						.setDescription('Set last counter role')
						.addRoleOption((role) =>
							role
								.setName('role')
								.setDescription('Role to add')
								.setRequired(true),
						),
				)
				.addSubcommand((channel) =>
					channel.setName('channel').setDescription('Set counting channel'),
				),
		)
		.addSubcommandGroup((get) =>
			get
				.setName('get')
				.setDescription('Get channel settings')
				.addSubcommand((highestCounter) =>
					highestCounter
						.setName('highestcounter')
						.setDescription('Get highest counter role'),
				)
				.addSubcommand((countingMute) =>
					countingMute
						.setName('countingmute')
						.setDescription('Get counting mute role'),
				)
				.addSubcommand((lastCounter) =>
					lastCounter
						.setName('lastcounter')
						.setDescription('Get last counter role'),
				)
				.addSubcommand((channel) =>
					channel.setName('channel').setDescription('Get counting channel'),
				),
		)
		.addSubcommand((list) =>
			list.setName('list').setDescription('List counting stats'),
		)
		// add integer option (required)
		.addSubcommand((force) =>
			force
				.setName('force')
				.setDescription('Override counting number')
				.addStringOption((option) =>
					option
						.setName('number')
						.setDescription('number for override')
						.setRequired(true),
				),
		)
		.addSubcommand((reset) =>
			reset.setName('reset').setDescription('Reset counting on this server'),
		)
		.setDefaultPermission(false),
	run: async (client, interaction) => {
		if (!interaction.guild) {
			return interaction.reply("Command can't run in DM!");
		}

		const group = interaction.options.getSubcommandGroup(false);
		const cmd = interaction.options.getSubcommand();

		client.db.Count.findOne({ where: { guildId: interaction.guild.id } }).then(
			(tok) => {
				if (!tok) {
					client.db.Count.create({
						guildId: interaction.guild.id,
					});
				}
			},
		);

		if (group == 'set') {
			await interaction.deferReply({ ephemeral: true });

			if (cmd == 'highestcounter') {
				const role = interaction.options.getRole('role');
				client.db.Count.update(
					{ highestCounterRole: role.id },
					{ where: { guildId: interaction.guild.id } },
				);
				interaction.editReply({
					content: `Highest Counter set to ${role}`,
					ephemeral: true,
				});
			}

			if (cmd == 'countingmute') {
				const role = interaction.options.getRole('role');
				client.db.Count.update(
					{ countingMute: role.id },
					{ where: { guildId: interaction.guild.id } },
				);
				interaction.editReply({
					content: `Highest Counter set to ${role}`,
					ephemeral: true,
				});
			}

			if (cmd == 'lastcounter') {
				const role = interaction.options.getRole('role');
				client.db.Count.update(
					{ lastCounterRole: role.id },
					{ where: { guildId: interaction.guild.id } },
				);
				interaction.editReply({
					content: `Last Counter set to ${role}`,
					ephemeral: true,
				});
			}

			if (cmd == 'channel') {
				const channel = interaction.channel;
				client.db.Count.update(
					{ channelId: channel.id },
					{ where: { guildId: interaction.guild.id } },
				);
				interaction.editReply({
					content: `Counting set to ${channel}`,
					ephemeral: true,
				});
			}
		}

		if (group == 'get') {
			await interaction.deferReply({ ephemeral: true });

			const tok = await client.db.Count.findOne({
				where: { guildId: interaction.guild.id },
			});

			if (cmd == 'channel') {
				if (!tok.channelId) {
					return interaction.editReply({
						content: 'Counting channel not set!',
						ephemeral: true,
					});
				}

				interaction.guild.channels
					.fetch(tok.channelId)
					.then((channel) => {
						interaction.editReply({
							content: `Counting channel set to ${channel}`,
							ephemeral: true,
						});
					})
					.catch((e) => {
						console.log(e.name);
						interaction.editReply({
							content: 'Error getting channel!',
							ephemeral: true,
						});
					});
			}

			if (cmd == 'highestcounter') {
				if (!tok.highestCounterRole) {
					return interaction.editReply({
						content: `Highest counter not set!`,
						ephemeral: true,
					});
				}

				const role = await interaction.guild.roles.fetch(
					tok.highestCounterRole,
				);
				interaction.editReply({
					content: `Highest Counter set to ${role}`,
					ephemeral: true,
				});
			}

			if (cmd == 'countingmute') {
				if (!tok.countingMute) {
					return interaction.editReply({
						content: `Counting mute not set!`,
						ephemeral: true,
					});
				}

				const role = await interaction.guild.roles.fetch(tok.countingMute);
				interaction.editReply({
					content: `Counting mute set to ${role}`,
					ephemeral: true,
				});
			}

			if (cmd == 'lastCounter') {
				if (!tok.lastCounter) {
					return interaction.editReply({
						content: `Last counter not set!`,
						ephemeral: true,
					});
				}

				const role = await interaction.guild.roles.fetch(tok.lastCounterRole);
				interaction.editReply({
					content: `Last counter set to ${role}`,
					ephemeral: true,
				});
			}
		}

		if (cmd == 'list') {
			await interaction.deferReply();

			const tok = await client.db.Count.findOne({
				where: { guildId: interaction.guild.id },
			});

			if (!tok) {
				const embd = new MessageEmbed().setDescription(
					'Counting not set up in this server!',
				);
				return interaction.editReply({ embeds: [embd], ephemeral: true });
			}

			let highestCounter = await interaction.guild.members
				.fetch(tok.highestCounter)
				.catch(console.error);
			let lastMember = await interaction.guild.members
				.fetch(tok.lastMember)
				.catch(console.error);

			let highestCounterRole = await interaction.guild.roles
				.fetch(tok.highestCounterRole)
				.catch(console.error);

			let lastCounterRole = await interaction.guild.roles
				.fetch(tok.lastCounterRole)
				.catch(console.error);

			let countingMuteRole = await interaction.guild.roles
				.fetch(tok.countingMute)
				.catch(console.error);

			if (!highestCounter || highestCounter.size > 0) {
				highestCounter = null;
			}
			if (!lastMember || lastMember.size > 0) {
				lastMember = null;
			}
			if (!highestCounterRole || highestCounterRole.size > 0) {
				highestCounterRole = null;
			}
			if (!lastCounterRole || lastCounterRole.size > 0) {
				lastCounterRole = null;
			}
			if (!countingMuteRole || countingMuteRole.size > 0) {
				countingMuteRole = null;
			}

			let totals = JSON.parse(tok.totalCount);
			console.log(totals);
			if (!highestCounter) {
				totals = '?';
			} else {
				totals = totals[highestCounter.id];
			}

			const msg =
				`Last Number: ${tok.lastNumber}\n` +
				`Highest Counter: ${highestCounter} - ${totals}\n` +
				`Last Member: ${lastMember}\n` +
				`**Roles:**\n` +
				`Last Counter: ${lastCounterRole}\n` +
				`Highest Counter: ${highestCounterRole}\n` +
				`Counting Mute: ${countingMuteRole}\n`;
			const embd = new MessageEmbed()
				.setTitle(`Counting stats for ${interaction.guild.name}`)
				.setDescription(msg);

			interaction
				.editReply({ embeds: [embd], ephemeral: true })
				.catch(console.error);
		}

		if (cmd == 'force') {
			await interaction.deferReply({ ephemeral: true });
			const num = interaction.options.getString('number');
			const forcedNum = num.match(/(\d+)$/)[1];

			client.db.Count.update(
				{ lastNumber: forcedNum },
				{ where: { guildId: interaction.guild.id } },
			).catch(console.error);

			interaction.editReply({
				content: `Count set to ${forcedNum}`,
				ephemeral: true,
			});
		}

		if (cmd == 'reset') {
			await interaction.deferReply({ ephemeral: true });

			client.db.Count.update(
				{
					channelId: null,
					highestCounter: null,
					countingMute: null,
					totalCount: null,
					lastMember: null,
					lastNumber: 0,
				},
				{ where: { guildId: interaction.guild.id } },
			).catch(console.error);

			interaction.editReply({
				content: `Count reset for ${interaction.guild.name}`,
				ephemeral: true,
			});
		}
	},
};
