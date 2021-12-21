// DM User invite link (make slash command?)
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Get my invite link'),
	async execute(interaction) {
		interaction.reply(
			'https://discord.com/api/oauth2/authorize?client_id=877049123000434689&permissions=8&scope=bot%20applications.commands',
		);
	},
};
