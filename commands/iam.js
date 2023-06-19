const color = require('colors/safe');
const { MessageEmbed } = require('discord.js');
const botUtils = require('../botUtils');

module.exports = {
	name: 'iam',
	description: 'Give yourself a role',
	help: 'Usage: `iam [role name]`',
	run: async (client, message, args) => {
		if (!message.guild) return;

		// find role
		const roles = botUtils.findRoles(
			await message.guild.roles.fetch(),
			args.join(' ').replaceAll('"', ''),
		);

		if (roles.size == 0) {
			return message
				.reply('Role not found!')
				.catch((e) => console.log(color.red(e.name)));
		}

		// get list from db
		client.db.GuildConfig.findOne({
			where: { guildId: message.guild.id },
		}).then((tok) => {
			if (tok) {
				const assignable = JSON.parse(tok.assignRoles);

				if (!assignable) {
					console.log(`No assignable roles for ${message.guild.name}!`);
					return message.reply('Error getting roles');
				}

				const r = roles.find((e) => assignable.includes(e.id));
				if (r) {
					message.member.roles
						.add(r)
						.then(() => {
							const embd = new MessageEmbed()
								.setColor(r.color)
								.setDescription(`Gave you the ${r} role!`);
							message.reply({ embeds: [embd] });
						})
						.catch((e) => {
							console.log(color.red(e.name));
							message.reply(`Error giving role!`);
						});
				} else {
					message.reply(`You can't have that role!`);
				}
			}
		});
	},
};
