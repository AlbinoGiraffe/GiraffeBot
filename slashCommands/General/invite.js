// DM User invite link (make slash command?)
const { SlashCommandBuilder } = require('@discordjs/builders');
const { inviteLink } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Get my invite link'),
	run: (client, interaction) => {
		interaction.member
			.createDM()
			.then((channel) => channel.send(inviteLink))
			.catch((e) => {
				interaction
					.reply({ content: 'Failed to DM link!', ephemeral: true })
					.catch(console.error);
				console.log(e);
			});
		interaction
			.reply({
				content: "I DM'd you my invite link!",
				ephemeral: true,
			})
			.catch(console.error);
	},
};
