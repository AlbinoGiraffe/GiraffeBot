const color = require('colors/safe');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'help',
	description: 'Get command help',
	help: 'Usage: `help [command name]`',
	run: (client, message, args = []) => {
		const cmd = client.commands.find((c) => c.name == args.join(' '));
		const embd = new MessageEmbed();

		if (cmd) {
			embd
				.setTitle(`Help for ${cmd.name}`)
				.setDescription(cmd.help)
				.setFooter("Type 'prefix' to get my command prefix");
		} else {
			let msg = '```';
			client.commands.forEach((c) => {
				msg = msg + `${c.name} - ${c.description}\n`;
			});
			msg = msg + '```';

			embd
				.setTitle('Help:')
				.setDescription(msg)
				.setFooter("Type 'prefix' to get my command prefix");
		}

		message.reply({ embeds: [embd] }).catch((e) => console.log(color.red(e)));
	},
};
