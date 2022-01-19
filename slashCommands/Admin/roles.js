const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const botUtils = require('../../botUtils');
const config = require('../../config.json');

module.exports = {
	moderator: true,
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
							option.setName('role').setDescription('role to add'),
						)
						.addStringOption((option) =>
							option
								.setName('list')
								.setDescription('list of role names/ids to add'),
						),
				)
				.addSubcommand((remove) =>
					remove
						.setName('remove')
						.setDescription('make role unassignable')
						.addRoleOption((option) =>
							option.setName('role').setDescription('role to add'),
						)
						.addStringOption((option) =>
							option
								.setName('list')
								.setDescription('list of role names/ids to remove'),
						),
				)
				.addSubcommand((list) =>
					list
						.setName('assignable')
						.setDescription('list assignable roles')
						.addIntegerOption((option) =>
							option.setName('page').setDescription('Page number'),
						)
						.addBooleanOption((option) =>
							option.setName('csv').setDescription('List as CSV'),
						),
				)
				.addSubcommand((listall) =>
					listall
						.setName('all')
						.setDescription('list all roles on server')
						.addIntegerOption((option) =>
							option.setName('page').setDescription('Page number'),
						)
						.addBooleanOption((option) =>
							option.setName('csv').setDescription('List as CSV'),
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
		)
		.addSubcommand((cmd) =>
			cmd.setName('reset').setDescription('reset role list'),
		),
	run: async (client, interaction) => {
		if (!interaction.guild) {
			return interaction.reply("Command can't run in DM!");
		}

		const group = interaction.options.getSubcommandGroup(false);
		const cmd = interaction.options.getSubcommand();

		if (group == 'list') {
			if (cmd == 'assignable') {
				await interaction.deferReply();
				const tok = await client.db.GuildConfig.findOne({
					where: { guildId: interaction.guild.id },
				});

				if (!tok || !tok.assignRoles) {
					const embed = new MessageEmbed()
						.setColor('RED')
						.setDescription(`Guild has no assignable roles!`);
					return interaction.editReply({ embeds: [embed] });
				}

				let role_list = [];
				const assign_list = JSON.parse(tok.assignRoles);
				for (const r of assign_list) {
					const role = await interaction.guild.roles.fetch(r);
					if (role) {
						role_list.push(role);
					}
				}

				let separator = '\n';
				const num_roles = role_list.length;
				const pg = interaction.options.getInteger('page');
				const csv = interaction.options.getBoolean('csv');

				if (csv) {
					separator = ', ';
				}

				role_list = splitRoles(role_list, 15);

				if (!num_roles) {
					const embed = new MessageEmbed()
						.setColor('RED')
						.setDescription(`Guild has no assignable roles!`);
					return interaction.editReply({ embeds: [embed] });
				}

				let n = 0;
				const rs = role_list.length;
				n = pg - 1;

				if (n > rs) {
					n = rs - 1;
				}
				if (n < 0) {
					n = 0;
				}

				const msg = await genRoleList(role_list, n, separator);

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

			if (cmd == 'all') {
				await interaction.deferReply();
				const guildRoles = await interaction.guild.roles.fetch();
				const role_list = splitRoles(Array.from(guildRoles.values()), 15);
				const num_roles = guildRoles.size - 1;
				const pg = interaction.options.getInteger('page');
				const csv = interaction.options.getBoolean('csv');
				let separator = '\n';
				if (csv) {
					separator = ', ';
				}

				let n = 0;
				const rs = role_list.length;

				if (pg) {
					n = pg - 1;
					if (pg > rs) {
						n = rs - 1;
					}
					if (pg == 0) n = 0;
				}

				const msg = await genRoleList(role_list, n, separator);

				const embd = new MessageEmbed().setDescription(
					`**${num_roles} Roles in ${interaction.guild.name}: (Page ${
						n + 1
					}/${rs})**\n${msg}`,
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
				const list = interaction.options.getString('list');

				if (!(list || role)) {
					const embed = new MessageEmbed().setDescription(
						`Supply either a role or role list!`,
					);
					return interaction.editReply({ embeds: [embed] });
				}

				if (role) {
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
				}

				if (list) {
					const roleNames = list.match(/(?<=")(?:\\.|[^"\\])*[^,\s](?=")/g);
					const duplicates = [];
					const noMatch = [];
					const inList = [];
					const added = [];
					let count = 0;

					for (const name of roleNames) {
						const r = botUtils.findRoles(
							await interaction.guild.roles.fetch(),
							name,
						);

						if (r.size == 1) {
							const newRole = r.first();

							const tok = await client.db.GuildConfig.findOne({
								where: { guildId: interaction.guild.id },
							});

							if (!tok) {
								return interaction.editReply('No config in this server!');
							}

							let roleList = JSON.parse(tok.assignRoles);
							if (!roleList) roleList = [];

							if (roleList.includes(newRole.id)) {
								inList.push(newRole);
							} else {
								roleList.push(newRole.id);
								added.push(newRole);
							}

							client.db.GuildConfig.update(
								{ assignRoles: JSON.stringify(roleList) },
								{ where: { guildId: interaction.guild.id } },
							);
							count++;
						}

						if (r.size > 1) {
							duplicates.push(r);
						}

						if (r.size == 0) {
							noMatch.push(name);
						}
					}

					const embd = new MessageEmbed().setTitle(
						`${count} roles added to list`,
					);

					if (duplicates.length > 0) {
						let dupes = '';
						duplicates.forEach((d) => {
							d.forEach((k) => {
								dupes += `${k} - ${k.id}\n`;
							});
							dupes += '\n';
						});
						embd.addField(`${duplicates.length} roles with duplicates.`, dupes);
					}

					if (inList.length > 0) {
						let listmsg = '';
						inList.forEach((k) => {
							listmsg += `${k} `;
						});
						embd.addField(`${inList.length} roles already in list.`, listmsg);
					}

					if (noMatch.length > 0) {
						let listmsg = '';
						noMatch.forEach((k) => {
							listmsg += `${k} `;
						});
						embd.addField(`${noMatch.length} didn't match any roles.`, listmsg);
					}

					if (added.length > 0) {
						let listmsg = '';
						added.forEach((k) => {
							listmsg += `${k} `;
						});
						embd.addField(`${added.length} roles added to list.`, listmsg);
					}
					interaction.editReply({ embeds: [embd] });
				}
				return;
			}

			// support list of names
			if (cmd == 'remove') {
				const role = interaction.options.getRole('role');
				const list = interaction.options.getString('list');

				if (!(list || role)) {
					const embed = new MessageEmbed().setDescription(
						`Supply either a role or role list!`,
					);
					return interaction.editReply({ embeds: [embed] });
				}

				if (role) {
					client.db.GuildConfig.findOne({
						where: { guildId: interaction.guild.id },
					}).then((tok) => {
						let roleList = JSON.parse(tok.assignRoles);
						if (!roleList) roleList = [];

						const index = roleList.indexOf(role.id);
						if (index > -1) {
							roleList.splice(index, 1);

							client.db.GuildConfig.update(
								{ assignRoles: JSON.stringify(roleList) },
								{ where: { guildId: interaction.guild.id } },
							).then(interaction.editReply('Role removed from list!'));
						} else {
							interaction.editReply('Role not in assignable list!');
						}
					});
				}

				if (list) {
					const roleNames = list.match(/(?<=")(?:\\.|[^"\\])*[^,\s](?=")/g);
					const duplicates = [];
					const noMatch = [];
					const notInList = [];
					const removed = [];
					let count = 0;

					for (const name of roleNames) {
						const r = botUtils.findRoles(
							await interaction.guild.roles.fetch(),
							name,
						);

						if (r.size == 1) {
							const newRole = r.first();

							const tok = await client.db.GuildConfig.findOne({
								where: { guildId: interaction.guild.id },
							});

							if (!tok) {
								return interaction.editReply('No config in this server!');
							}

							let roleList = JSON.parse(tok.assignRoles);
							if (!roleList) roleList = [];

							const index = roleList.indexOf(newRole.id);

							if (index > -1) {
								roleList.splice(index, 1);
								removed.push(newRole);
								count++;
							} else {
								notInList.push(newRole);
							}

							await client.db.GuildConfig.update(
								{ assignRoles: JSON.stringify(roleList) },
								{ where: { guildId: interaction.guild.id } },
							);
						}

						if (r.size > 1) {
							duplicates.push(r);
						}

						if (r.size == 0) {
							noMatch.push(name);
						}
					}

					const embd = new MessageEmbed().setTitle(
						`${count} roles removed from list`,
					);

					if (duplicates.length > 0) {
						let dupes = '';
						duplicates.forEach((d) => {
							d.forEach((k) => {
								dupes += `${k} - ${k.id}\n`;
							});
							dupes += '\n';
						});
						console.log(dupes);
						console.log(duplicates.length);
						embd.addField(`${duplicates.length} roles with duplicates.`, dupes);
					}

					if (notInList.length > 0) {
						let listmsg = '';
						notInList.forEach((k) => {
							listmsg += `${k} `;
						});
						embd.addField(
							`${notInList.length} roles weren't in the list.`,
							listmsg,
						);
					}

					if (noMatch.length > 0) {
						let listmsg = '';
						noMatch.forEach((k) => {
							listmsg += `${k} `;
						});
						embd.addField(`${noMatch.length} didn't match any roles.`, listmsg);
					}

					if (removed.length > 0) {
						let listmsg = '';
						removed.forEach((k) => {
							listmsg += `${k} `;
						});
						embd.addField(
							`${removed.length} roles removed from list.`,
							listmsg,
						);
					}
					interaction.editReply({ embeds: [embd] });
				}
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
			return;
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

		if (cmd == 'reset') {
			await client.db.GuildConfig.update(
				{ assignRoles: null },
				{ where: { guildId: interaction.guild.id } },
			);
			interaction.editReply('Roles succesfully reset');
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

function genRoleList(role_list, n, separator) {
	let msg = '```';
	role_list[n].forEach((r) => {
		if (!(r.position == 0)) {
			if (!(role_list[n].at(-1) == r)) {
				msg = msg + `"${r.name}"${separator}`;
			} else {
				msg = msg + `"${r.name}"`;
			}
		}
	});
	msg = msg + '```';
	return msg;
}
