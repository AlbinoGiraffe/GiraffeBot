// DM User invite link (make slash command?)
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder().setName('pdf').setDescription('😳'),
	run: (client, interaction) => {
		interaction.reply({ content: 'haha', ephemeral: true });
	},
};
