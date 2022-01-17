const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const botUtils = require('../../botUtils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('permission')
		.setDescription('Command permission management')
		.setDefaultPermission(false)
		.addSubcommandGroup((add) =>
			add
				.setName('add')
				.setDescription('add moderators/admins')
				.addSubcommand((mod) =>
					mod
						.setName('moderator')
						.setDescription('Add moderator to bot')
						.addRoleOption((option) =>
							option.setName('role').setDescription('role to make mod'),
						)
						.addUserOption((option) =>
							option.setName('member').setDescription('add member as mod'),
						),
				)
				.addSubcommand((admin) =>
					admin
						.setName('admin')
						.setDescription('Add admin to bot')
						.addRoleOption((option) =>
							option.setName('role').setDescription('role to make admin'),
						)
						.addUserOption((option) =>
							option.setName('member').setDescription('add member as admin'),
						),
				),
		)
		.addSubcommandGroup((remove) =>
			remove
				.setName('remove')
				.setDescription('remove moderators/admins')
				.addSubcommand((mod) =>
					mod
						.setName('moderator')
						.setDescription('Remove moderator from bot')
						.addRoleOption((option) =>
							option.setName('role').setDescription('role to remove'),
						)
						.addUserOption((option) =>
							option.setName('member').setDescription('remove member as mod'),
						),
				)
				.addSubcommand((admin) =>
					admin
						.setName('admin')
						.setDescription('Remove admin to bot')
						.addRoleOption((option) =>
							option.setName('role').setDescription('role to remove'),
						)
						.addUserOption((option) =>
							option.setName('member').setDescription('remove member as admin'),
						),
				),
		)
		.addSubcommand((reset) =>
			reset.setName('reset').setDescription('reset mod/admin settings'),
		)
		.addSubcommand((list) =>
			list.setName('list').setDescription('list permissions'),
		),
	run: async (client, interaction) => {
		const group = interaction.options.getSubcommandGroup(false);
		const cmd = interaction.options.getSubcommand();
		await interaction.deferReply({ ephemeral: true });

		if (group == 'add') {
			const role = interaction.options.getRole('role');
			const member = interaction.options.getUser('member');

			if (!(role || member)) {
				return interaction.editReply('Supply at least a role or member!');
			}

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
		}

		if (group == 'remove') {
			if (cmd == 'moderator') {
				interaction.editReply('not implemented');
			}

			if (cmd == 'admin') {
				interaction.editReply('not implemented');
			}
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

				embed.addField(`Admin Roles (${adminRoles.length}):`, roles);
			} else {
				embed.addField(`Admin Roles (0):`, 'none');
			}

			if (modRoles.length > 0) {
				let roles = '';
				modRoles.forEach((n) => {
					roles += `${n}\n`;
				});

				embed.addField(`Mod Roles (${modRoles.length}):`, roles);
			} else {
				embed.addField(`Mod Roles (0):`, 'none');
			}

			interaction.editReply({ embeds: [embed] });
		}
	},
};
