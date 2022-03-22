const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guilds')
		.setDescription('list guilds bot is in'),
	run: (client, interaction) => {
		if (interaction.member.id != config.adminId) {
			interaction.reply(`Only bot owner can do this!`).catch(console.error);
		}

		client.guilds.fetch().then((guilds) => {
			let names = '';
			console.log(guilds);
			guilds.forEach((guild) => {
				names += `${guild.name}\n`;
			});
			interaction
				.reply({ content: names, ephemeral: true })
				.catch(console.error);
		});

		return;
	},
};
