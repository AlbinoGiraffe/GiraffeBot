const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
// const botUtils = require('../../botUtils');

// TODO: get list, force

module.exports = {
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
		.setDefaultPermission(false),
	run: async (client, interaction) => {
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
			if (cmd == 'highestcounter') {
				const role = interaction.options.getRole('role');
				client.db.Count.update(
					{ highestCounterRole: role.id },
					{ where: { guildId: interaction.guild.id } },
				);
				interaction.reply({
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
				interaction.reply({
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
				interaction.reply({
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
				interaction.reply({
					content: `Counting set to ${channel}`,
					ephemeral: true,
				});
			}
		}

		if (group == 'get') {
			const tok = await client.db.Count.findOne({
				where: { guildId: interaction.guild.id },
			});

			if (cmd == 'channel') {
				if (!tok.channelId) {
					return interaction.reply({
						content: 'Counting channel not set!',
						ephemeral: true,
					});
				}

				interaction.guild.channels
					.fetch(tok.channelId)
					.then((channel) => {
						interaction.reply({
							content: `Counting channel set to ${channel}`,
							ephemeral: true,
						});
					})
					.catch((e) => {
						console.log(e.name);
						interaction.reply({
							content: 'Error getting channel!',
							ephemeral: true,
						});
					});
			}

			if (cmd == 'highestcounter') {
				if (!tok.highestCounterRole) {
					return interaction.reply({
						content: `Highest counter not set!`,
						ephemeral: true,
					});
				}

				const role = await interaction.guild.roles.fetch(
					tok.highestCounterRole,
				);
				interaction.reply({
					content: `Highest Counter set to ${role}`,
					ephemeral: true,
				});
			}

			if (cmd == 'countingmute') {
				if (!tok.countingMute) {
					return interaction.reply({
						content: `Counting mute not set!`,
						ephemeral: true,
					});
				}

				const role = await interaction.guild.roles.fetch(tok.countingMute);
				interaction.reply({
					content: `Counting mute set to ${role}`,
					ephemeral: true,
				});
			}

			if (cmd == 'lastCounter') {
				if (!tok.lastCounter) {
					return interaction.reply({
						content: `Last counter not set!`,
						ephemeral: true,
					});
				}

				const role = await interaction.guild.roles.fetch(tok.lastCounterRole);
				interaction.reply({
					content: `Last counter set to ${role}`,
					ephemeral: true,
				});
			}
		}

		if (cmd == 'list') {
			const tok = await client.db.Count.findOne({
				where: { guildId: interaction.guild.id },
			});

			if (!tok) {
				const embd = new MessageEmbed().setDescription(
					'Counting not set up in this server!',
				);
				return interaction.reply({ embeds: [embd], ephemeral: true });
			}

			let highestCounter = await interaction.guild.members
				.fetch(tok.lastMember)
				.catch(console.error);
			let lastMember = await interaction.guild.members
				.fetch(tok.lastMember)
				.catch(console.error);

			if (!highestCounter || highestCounter.size > 0) {
				highestCounter = null;
			}
			if (!lastMember || lastMember.size > 0) {
				lastMember = null;
			}

			let totals = JSON.parse(tok.totalCount);
			if (!highestCounter) {
				totals = '?';
			} else {
				totals = totals[highestCounter.id];
			}

			const msg =
				`Last Number: ${tok.lastNumber}\n` +
				`Highest Counter: ${highestCounter} - ${totals}\n` +
				`Last Member: ${lastMember}`;
			const embd = new MessageEmbed()
				.setTitle(`Counting stats for ${interaction.guild.name}`)
				.setDescription(msg);

			interaction.reply({ embeds: [embd], ephemeral: true });
		}

		if (cmd == 'force') {
			const num = interaction.options.getString('number');
			const forcedNum = num.match(/(\d+)$/)[1];

			client.db.Count.update(
				{ lastNumber: forcedNum },
				{ where: { guildId: interaction.guild.id } },
			).catch(console.error);

			interaction.reply({
				content: `Count set to ${forcedNum}`,
				ephemeral: true,
			});
		}
	},
};
