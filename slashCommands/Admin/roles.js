const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const botUtils = require('../../botUtils');
const config = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Role management')
		.addSubcommandGroup((editGroup) =>
			editGroup
				.setName('edit')
				.setDescription('Edit role attributes')
				.addSubcommand((color) =>
					color
						.setName('color')
						.setDescription('Edit role color')
						.addRoleOption((option) =>
							option
								.setName('role')
								.setDescription('role to edit')
								.setRequired(true),
						)
						.addStringOption((option) =>
							option
								.setName('color')
								.setDescription('Color in hex or int')
								.setRequired(true),
						),
				)
				.addSubcommand((name) =>
					name
						.setName('name')
						.setDescription("change a role's name")
						.addRoleOption((option) =>
							option
								.setName('role')
								.setDescription('role to edit')
								.setRequired(true),
						)
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription('new role name')
								.setRequired(true),
						),
				),
		)
		.addSubcommandGroup((listGroup) =>
			listGroup
				.setName('list')
				.setDescription('Manage assignable roles')
				.addSubcommand((add) =>
					add
						.setName('add')
						.setDescription('make role assignable')
						.addRoleOption((option) =>
							option
								.setName('role')
								.setDescription('role to add')
								.setRequired(true),
						),
				)
				.addSubcommand((remove) =>
					remove
						.setName('remove')
						.setDescription('make role unassignable')
						.addRoleOption((option) =>
							option
								.setName('role')
								.setDescription('role to add')
								.setRequired(true),
						),
				)
				.addSubcommand((list) =>
					list.setName('assignable').setDescription('list assignable roles'),
				)
				.addSubcommand((listall) =>
					listall
						.setName('all')
						.setDescription('list all roles on server')
						.addIntegerOption((option) =>
							option.setName('page').setDescription('Page number'),
						),
				),
		)
		.addSubcommand((cmd) =>
			cmd
				.setName('create')
				.setDescription('create a role')
				.addStringOption((option) =>
					option
						.setName('name')
						.setDescription('Name of role to create')
						.setRequired(true),
				)
				.addStringOption((option) =>
					option.setName('color').setDescription('Color in hex or int'),
				),
		)
		.addSubcommand((cmd) =>
			cmd
				.setName('delete')
				.setDescription('delete a role')
				.addRoleOption((option) =>
					option
						.setName('role')
						.setDescription('Role to delete')
						.setRequired(true),
				),
		)
		.addSubcommand((cmd) =>
			cmd
				.setName('find')
				.setDescription('find a role')
				.addStringOption((option) =>
					option
						.setName('query')
						.setDescription('name or id of role')
						.setRequired(true),
				),
		),
	run: async (client, interaction) => {
		const group = interaction.options.getSubcommandGroup(false);
		const cmd = interaction.options.getSubcommand();

		if (group == 'list') {
			if (cmd == 'assignable') {
				await interaction.deferReply();

				// get id list
				// for each id, fetch the role
				// add to msg
				// embed
				interaction.editReply('Not implemented');
			}

			if (cmd == 'all') {
				await interaction.deferReply();
				const guildRoles = await interaction.guild.roles.fetch();
				const role_list = splitRoles(Array.from(guildRoles.values()), 15);
				const num_roles = guildRoles.size - 1;
				const pg = interaction.options.getInteger('page');

				let n = 0;
				const rs = role_list.length;

				if (pg) {
					n = pg - 1;
					if (pg > rs) {
						n = rs - 1;
					}
					if (pg == 0) n = 0;
				}

				const msg = await genRoleList(role_list, n);

				if (num_roles == 0) {
					const embed = new MessageEmbed()
						.setColor('RED')
						.setDescription(`Guild has no roles!`);
					return interaction.editReply({ embeds: [embed] });
				}

				const embd = new MessageEmbed().setDescription(
					`**${num_roles} Roles (Page ${n + 1}/${rs}):**\n${msg}`,
				);
				return interaction.editReply({ embeds: [embd] });
			}

			// Admin commands

			await interaction.deferReply({ ephemeral: true });

			if (interaction.user.id != config.adminId) {
				return interaction.editReply({
					content: "You don't have permission to use that command!",
					ephemeral: true,
				});
			}

			// Support list of role names/ids
			if (cmd == 'add') {
				const role = interaction.options.getRole('role');

				client.db.GuildConfig.findOne({
					where: { guildId: interaction.guild.id },
				}).then((tok) => {
					let roleList = JSON.parse(tok.assignRoles);
					if (!roleList) roleList = [];

					if (roleList.includes(role.id)) {
						return interaction.editReply('Role already in list!');
					}

					roleList.push(role.id);
					client.db.GuildConfig.update(
						{ assignRoles: JSON.stringify(roleList) },
						{ where: { guildId: interaction.guild.id } },
					).then(interaction.editReply('Role added'));
				});
				return;
			}

			if (cmd == 'remove') {
				const role = interaction.options.getRole('role');

				client.db.GuildConfig.findOne({
					where: { guildId: interaction.guild.id },
				}).then((tok) => {
					let roleList = JSON.parse(tok.assignRoles);
					if (!roleList) roleList = [];

					if (roleList.includes(role.id)) {
						roleList.pop(role.id);

						client.db.GuildConfig.update(
							{ assignRoles: JSON.stringify(roleList) },
							{ where: { guildId: interaction.guild.id } },
						).then(interaction.editReply('Role removed from list!'));
					} else {
						interaction.editReply('Role not in assignable list!');
					}
				});
				return;
			}

			return;
		}

		// Admin commands
		await interaction.deferReply({ ephemeral: true });

		if (interaction.user.id != config.adminId) {
			return interaction.editReply({
				content: "You don't have permission to use that command!",
				ephemeral: true,
			});
		}

		if (group == 'edit') {
			const role = interaction.options.getRole('role');

			// support list of names/ids?
			if (cmd == 'color') {
				const newColor = interaction.options.getString('color');
				role
					.edit({ color: newColor.toUpperCase() })
					.then(() => {
						const embed = new MessageEmbed()
							.setColor(role.color)
							.setDescription(`${role} color updated!`);
						interaction.editReply({ embeds: [embed] });
					})
					.catch((e) => {
						console.log(e.name);
						const embed = new MessageEmbed()
							.setColor('RED')
							.setDescription(`Error changing color!`);
						interaction.editReply({ embeds: [embed] });
					});
			}

			if (cmd == 'name') {
				const newName = interaction.options.getString('name');
				role
					.edit({ name: newName })
					.then(() => {
						const embed = new MessageEmbed()
							.setColor(role.color)
							.setDescription(`${role} name updated!`);
						interaction.editReply({ embeds: [embed] });
					})
					.catch((e) => {
						console.log(e.name);
						const embed = new MessageEmbed()
							.setColor('RED')
							.setDescription(`Error changing name!`);
						interaction.editReply({ embeds: [embed] });
					});
			}
		}

		if (cmd == 'create') {
			const roleName = interaction.options.getString('name');
			const roleColor = interaction.options.getString('color');

			if (!roleColor) {
				interaction.guild.roles
					.create({ name: roleName, color: roleColor })
					.then((role) => {
						const embed = new MessageEmbed()
							.setColor(role.color)
							.setDescription(`${role} created!`);
						interaction.editReply({ embeds: [embed] });
					})
					.catch((e) => {
						console.log(e.name);
						const embed = new MessageEmbed()
							.setColor('RED')
							.setDescription(`Error creating role!`);
						interaction.editReply({ embeds: [embed] });
					});
			} else {
				interaction.guild.roles
					.create({ name: roleName, color: roleColor.toUpperCase() })
					.then((role) => {
						const embed = new MessageEmbed()
							.setColor(role.color)
							.setDescription(`${role} created!`);
						interaction.editReply({ embeds: [embed] });
					})
					.catch((e) => {
						console.log(e.name);
						const embed = new MessageEmbed()
							.setColor('RED')
							.setDescription(`Error creating role!`);
						interaction.editReply({ embeds: [embed] });
					});
			}
		}

		// support list of names/ids
		if (cmd == 'delete') {
			const role = interaction.options.getRole('role');
			role
				.delete()
				.then(() => {
					const embed = new MessageEmbed()
						.setColor(role.color)
						.setDescription(`${role.name} deleted!`);
					interaction.editReply({ embeds: [embed] });
				})
				.catch((e) => {
					console.log(e.name);
					const embed = new MessageEmbed()
						.setColor('RED')
						.setDescription(`Error deleting role!`);
					interaction.editReply({ embeds: [embed] });
				});
		}

		if (cmd == 'find') {
			const roleQuery = interaction.options.getString('query');
			const result = botUtils.findRoles(
				await interaction.guild.roles.fetch(),
				roleQuery,
			);

			let msg = '```';
			result.forEach((r) => {
				msg = msg + `${r.name} - ${r.id}\n`;
			});
			msg = msg + '```';

			const embd = new MessageEmbed().setDescription(
				`**Roles matching query:**\n${msg}`,
			);
			interaction.editReply({ embeds: [embd] });
		}
		return;
	},
};

function splitRoles(arr, len) {
	const chunks = [];
	const n = arr.length;
	let i = 0;

	while (i < n) {
		chunks.push(arr.slice(i, (i += len)));
	}

	return chunks;
}

function genRoleList(role_list, n) {
	let msg = '```';
	role_list[n].forEach((r) => {
		if (!(r.position == 0)) {
			msg = msg + `"${r.name}"\n`;
		}
	});
	msg = msg + '```';
	return msg;
}

// function listDuplicateRoles(roleList) {
// 	return;
// }
