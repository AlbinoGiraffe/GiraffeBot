// DM User invite link (make slash command?)
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder().setName('pdf').setDescription('😳'),
	run: (client, interaction) => {
		client.users
			.fetch('878185975115808788')
			.then((member) => {
				interaction
					.reply({ content: 'haha', ephemeral: true })
					.catch(console.error);
				interaction.channel.send(`${member} pdf file 😳`);
			})
			.catch(console.error);
	},
};
