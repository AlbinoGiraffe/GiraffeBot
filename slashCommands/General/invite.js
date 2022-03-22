// DM User invite link (make slash command?)
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { inviteLink } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Get my invite link'),
	run: (client, interaction) => {
		const embd = new MessageEmbed().setDescription(
			`Click the link to add this bot to your server: [Click me](${inviteLink})`,
		);
		interaction
			.reply({
				embeds: [embd],
				ephemeral: true,
			})
			.catch(console.error);
	},
};
