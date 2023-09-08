const color = require('colors/safe');
const { MessageEmbed } = require('discord.js');
const botUtils = require('../botUtils');

module.exports = {
	name: 'iamnot',
	description: 'Remove a role from yourself',
	help: 'Usage: `iamnot [role name]`',
	run: async (client, message, args) => {
		if (!message.guild) return;

		// find role
		const roles = botUtils.findRoles(
			await message.guild.roles.fetch(),
			args.join(' ').replaceAll('"', ''),
		);
		// remove role from user
		message.member.roles
			.remove(roles)
			.then(() => {
				const embd = new MessageEmbed()
					.setColor('0xe74c3c')
					.setDescription(`Role(s) removed!`);
				message.reply({ embeds: [embd] }).catch();
			})
			.catch((e) => {
				console.log(color.red(e.name));
				message.reply(`Error removing role!`).catch();
			});
	},
};
