const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('permission')
		.setDescription('Command permission management')
		.setDefaultPermission(false)
		.addSubcommandGroup((add) =>
			add
				.setName('add')
				.setDescription('add moderators/admins')
				.addSubcommand(
					(mod) =>
						mod
							.setName('moderator')
							.setDescription('Add moderator to bot')
							.addRoleOption((option) =>
								option
									.setName('role')
									.setDescription('role to make mod')
									.setRequired(true),
							),
					// .addUserOption((option) =>
					// 	option.setName('member').setDescription('add member as mod'),
					// ),
				)
				.addSubcommand(
					(admin) =>
						admin
							.setName('admin')
							.setDescription('Add admin to bot')
							.addRoleOption((option) =>
								option
									.setName('role')
									.setDescription('role to make admin')
									.setRequired(true),
							),
					// .addUserOption((option) =>
					// 	option.setName('member').setDescription('add member as admin'),
					// ),
				),
		)
		.addSubcommandGroup((remove) =>
			remove
				.setName('remove')
				.setDescription('remove moderators/admins')
				.addSubcommand(
					(mod) =>
						mod
							.setName('moderator')
							.setDescription('Remove moderator from bot')
							.addRoleOption((option) =>
								option
									.setName('role')
									.setDescription('role to remove')
									.setRequired(true),
							),
					// .addUserOption((option) =>
					// 	option.setName('member').setDescription('remove member as mod'),
					// ),
				)
				.addSubcommand(
					(admin) =>
						admin
							.setName('admin')
							.setDescription('Remove admin from bot')
							.addRoleOption((option) =>
								option
									.setName('role')
									.setDescription('role to remove')
									.setRequired(true),
							),
					// .addUserOption((option) =>
					// 	option.setName('member').setDescription('remove member as admin'),
					// ),
				),
		)
		.addSubcommand((reset) =>
			reset.setName('reset').setDescription('reset mod/admin settings'),
		)
		.addSubcommand((list) =>
			list.setName('list').setDescription('list permissions'),
		)
		.addSubcommand((update) =>
			update.setName('update').setDescription('update permissions'),
		),
	run: async (client, interaction) => {
		if (!interaction.guild) {
			return interaction.reply("Command can't run in DM!");
		}

		const group = interaction.options.getSubcommandGroup(false);
		const cmd = interaction.options.getSubcommand();
		await interaction.deferReply({ ephemeral: true });

		if (group == 'add') {
			const role = interaction.options.getRole('role');
			const tok = await client.db.GuildConfig.findOne({
				where: { guildId: interaction.guild.id },
			});

			if (!tok) {
				const embed = new MessageEmbed()
					.setColor('RED')
					.setDescription(`Guild has no config!`);
				return interaction.editReply({ embeds: [embed] });
			}

			let modList = [];
			let adminList = [];

			if (tok.modRoles) {
				modList = JSON.parse(tok.modRoles);
			}

			if (tok.adminRoles) {
				adminList = JSON.parse(tok.adminRoles);
			}

			if (cmd == 'moderator') {
				if (role) {
					if (!modList.includes(role.id)) modList.push(role.id);
				}
				// figure out member perms
			}

			if (cmd == 'admin') {
				if (role) {
					if (!adminList.includes(role.id)) adminList.push(role.id);
				}
			}

			await client.db.GuildConfig.update(
				{
					adminRoles: JSON.stringify(adminList),
					modRoles: JSON.stringify(modList),
				},
				{ where: { guildId: interaction.guild.id } },
			)
				.then(interaction.editReply('Command permissions updated'))
				.catch(() => {
					interaction.editReply('Error updating permissions');
					console.error;
				});
			await updatePermissions(client, interaction);
		}

		if (group == 'remove') {
			const role = interaction.options.getRole('role');
			const tok = await client.db.GuildConfig.findOne({
				where: { guildId: interaction.guild.id },
			});

			if (!tok) {
				const embed = new MessageEmbed()
					.setColor('RED')
					.setDescription(`Guild has no config!`);
				return interaction.editReply({ embeds: [embed] });
			}

			let modList = [];
			let adminList = [];

			const modRoles = [];
			const adminRoles = [];

			if (tok.modRoles) {
				modList = JSON.parse(tok.modRoles);
			}

			if (tok.adminRoles) {
				adminList = JSON.parse(tok.adminRoles);
			}

			if (cmd == 'moderator') {
				if (role) {
					const index = modList.indexOf(role.id);
					if (index > -1) {
						modList.splice(index, 1);
						modRoles.push(role);
					}
				}
				// figure out member perms
			}

			if (cmd == 'admin') {
				const index = adminList.indexOf(role.id);
				if (index > -1) {
					adminList.splice(index, 1);
					adminRoles.push(role);
				}
			}

			await removePermissions(client, interaction, modRoles, adminRoles);
			await client.db.GuildConfig.update(
				{
					adminRoles: JSON.stringify(adminList),
					modRoles: JSON.stringify(modList),
				},
				{ where: { guildId: interaction.guild.id } },
			)
				.then(interaction.editReply('Command permissions updated'))
				.catch(() => {
					interaction.editReply('Error updating permissions');
					console.error;
				});
		}

		if (cmd == 'reset') {
			client.db.GuildConfig.update(
				{ modRoles: null, adminRoles: null },
				{ where: { guildId: interaction.guild.id } },
			)
				.then(interaction.editReply('Succesfully reset permissions'))
				.catch(() => {
					interaction.editReply('Error reseting permissions');
					console.error;
				});
		}

		if (cmd == 'list') {
			const tok = await client.db.GuildConfig.findOne({
				where: { guildId: interaction.guild.id },
			});

			if (!tok) return interaction.editReply('No guild config!');
			await interaction.guild.roles.fetch();

			const modRoles = [];
			const adminRoles = [];

			const embed = new MessageEmbed().setTitle(
				`Permissions for ${interaction.guild.name}`,
			);

			if (tok.modRoles) {
				for (const roleid of JSON.parse(tok.modRoles)) {
					const role = await interaction.guild.roles
						.fetch(roleid)
						.catch(console.error);

					if (role) {
						modRoles.push(role);
					}
				}
			}

			if (tok.adminRoles) {
				for (const roleid of JSON.parse(tok.adminRoles)) {
					const role = await interaction.guild.roles
						.fetch(roleid)
						.catch(console.error);

					if (role) {
						adminRoles.push(role);
					}
				}
			}

			if (adminRoles.length > 0) {
				let roles = '';
				adminRoles.forEach((n) => {
					roles += `${n}\n`;
				});

				embed.addFields({
					name: `Admin Roles (${adminRoles.length}):`,
					value: roles,
				});
			} else {
				embed.addFields({ name: `Admin Roles (0):`, value: 'none' });
			}

			if (modRoles.length > 0) {
				let roles = '';
				modRoles.forEach((n) => {
					roles += `${n}\n`;
				});

				embed.addFields({
					name: `Mod Roles (${modRoles.length}):`,
					value: roles,
				});
			} else {
				embed.addFields({ name: `Mod Roles (0):`, value: 'none' });
			}

			interaction.editReply({ embeds: [embed] });
		}

		if (cmd == 'update') {
			await updatePermissions(client, interaction);
			interaction.editReply('Permissions updated');
		}
	},
};

async function updatePermissions(client, interaction) {
	const adminPermissions = [
		{
			id: config.adminId,
			type: 'USER',
			permission: true,
		},
	];

	const modPermissions = [
		{
			id: config.adminId,
			type: 'USER',
			permission: true,
		},
	];

	const tok = await client.db.GuildConfig.findOne({
		where: { guildId: interaction.guild.id },
	});

	if (!tok) return;

	let modList = [];
	let adminList = [];

	if (tok.modRoles) {
		modList = JSON.parse(tok.modRoles);
	}

	if (tok.adminRoles) {
		adminList = JSON.parse(tok.adminRoles);
	}

	modList.forEach((cid) => {
		modPermissions.push({ id: cid, type: 'ROLE', permission: true });
	});

	adminList.forEach((cid) => {
		adminPermissions.push({ id: cid, type: 'ROLE', permission: true });
	});

	// update permissions
	await interaction.guild.commands
		.fetch()
		.then((guildCommands) => {
			if (guildCommands) {
				guildCommands.forEach((c) => {
					if (client.adminSlashCommands.includes(c.name)) {
						c.permissions.add({ permissions: adminPermissions });
					}

					if (client.modSlashCommands.includes(c.name)) {
						c.permissions.add({ permissions: modPermissions });
					}
				});
			}
		})
		.catch(console.error);
}

async function removePermissions(client, interaction, modRoles, adminRoles) {
	// update permissions
	await interaction.guild.commands
		.fetch()
		.then((guildCommands) => {
			if (guildCommands) {
				guildCommands.forEach((c) => {
					if (client.adminSlashCommands.includes(c.name)) {
						c.permissions.remove({ roles: adminRoles });
					}

					if (client.modSlashCommands.includes(c.name)) {
						c.permissions.add({ roles: modRoles });
					}
				});
			}
		})
		.catch(console.error);
}
