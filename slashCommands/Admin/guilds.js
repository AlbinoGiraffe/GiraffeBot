const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guilds')
		.setDescription('list guilds bot is in'),
	run: (client, interaction) => {
		if (interaction.member.id != config.adminId) {
			interaction.reply(`Only bot owner's can do this!`).catch(console.error);
		}

		let names = '';
		for (const g of client.guilds) {
			names += `${g.name}\n`;
		}

		interaction.reply({ content: names, ephemeral: true }).catch(console.error);
		return;
	},
};
