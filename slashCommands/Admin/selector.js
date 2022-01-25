const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('selector')
		.setDescription('Set selector to the current channel')
		.addSubcommand((set) =>
			set
				.setName('set')
				.setDescription('set selector channel')
				.addBooleanOption((option) =>
					option
						.setName('remove')
						.setDescription('remove this channel as a selector channel.'),
				),
		)
		.addSubcommand((get) =>
			get.setName('get').setDescription('get selector channel'),
		)
		.addSubcommand((init) =>
			init.setName('setup').setDescription('set up selector'),
		)
		.setDefaultPermission(false),
	run: async (client, interaction) => {
		if (!interaction.guild) {
			return interaction.reply("Command can't run in DM!");
		}

		const cmd = interaction.options.getSubcommand();

		if (cmd == 'set') {
			const op = interaction.options.getBoolean('remove');

			let newId;
			if (op) {
				newId = null;
			} else {
				newId = interaction.channel.id;
			}

			client.db.GuildConfig.update(
				{
					selectorId: newId,
				},
				{ where: { guildId: interaction.guild.id } },
			)
				.then(() =>
					interaction
						.reply({
							content: `Selector channel updated.`,
							ephemeral: true,
						})
						.catch(console.error),
				)
				.catch(() =>
					interaction.reply({
						content: `Error updating selector channel!`,
						ephemeral: true,
					}),
				);
		}

		if (cmd == 'get') {
			const tok = await client.db.GuildConfig.findOne({
				where: { guildId: interaction.guild.id },
			});

			if (!tok.selectorId) {
				return interaction.reply({
					content: `Selector channel not set!`,
					ephemeral: true,
				});
			}

			const channel = await interaction.guild.channels.fetch(tok.selectorId);

			interaction.reply({
				content: `Selector set to ${channel}`,
				ephemeral: true,
			});
		}

		if (cmd == 'setup') {
			await interaction.deferReply({ ephemeral: true });
			await setup(client, interaction);
		}
	},
};

async function setup(client, interaction) {
	console.log(`Setting up selector for ${interaction.guild.name}`);

	client.guilds
		.fetch(interaction.guild.id)
		.then((g) => {
			g.roles
				.fetch()
				.then((r) => {
					console.log('roles fetched');
					const dup = findDuplicates(r);
					if (dup) {
						console.log(dup);
					} else {
						console.log('No duplicates :)');
					}
					updateRoles(client, g, interaction);
					interaction.editReply(`Finished setting up!`);
				})
				.catch(() => {
					console.error;
					interaction.editReply(`Error setting up!`);
				});
		})
		.catch(() => {
			console.error;
			interaction.editReply(`Error setting up!`);
		});
}

function findDuplicates(r) {
	let count = 0;
	const dup = [];
	r.forEach((v) => {
		r.forEach((b) => {
			if (b.name.toLowerCase() == v.name.toLowerCase()) {
				count++;
			}
		});
		if (count > 1) {
			dup.push(v.name);
			console.log(`count for ${v.name}: ${count}`);
		}
		count = 0;
	});

	if (dup.length > 0) {
		return dup;
	} else {
		return null;
	}
}

function updateRoles(client, g, interaction) {
	console.log('Updating roles');
	client.db.Majors.findAll().then((ma) => {
		ma.forEach((m) => {
			const roleName = m.major;
			g.roles.fetch().then((r) => {
				const cd = r.find(
					(x) => x.name.toLowerCase() == roleName.toLowerCase(),
				);

				if (!cd) {
					g.roles
						.create({ name: roleName })
						.then((rc) => console.log(`Created ${rc.name}`))
						.catch(() => {
							console.error;
							interaction.editReply(`Error setting up!`);
						});
				} else {
					cd.edit({ name: roleName });
					console.log(`${roleName} already in server, edited`);
				}
			});
		});
	});
}
