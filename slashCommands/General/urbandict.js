const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ud = require('urban-dictionary');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('urban')
		.setDescription('Look up words on Urban Dictionary')
		.addStringOption((option) =>
			option
				.setName('phrase')
				.setDescription('Phrase to look up')
				.setRequired(true),
		),
	run: async (client, interaction) => {
		await interaction.deferReply().catch(console.error);
		urbanDefine(interaction);
	},
};

function urbanDefine(interaction) {
	ud.define(interaction.options.getString('phrase'))
		.then((results) => {
			sendEmbed(interaction, results[0], false);
		})
		.catch((error) => {
			sendEmbed(interaction, null, true);
			console.error(`urban-dictionary error: ${error.message}`);
		});
}

function sendEmbed(interaction, result, error) {
	if (!error) {
		const embed = new MessageEmbed()
			.setColor('0xe74c3c')
			.setTitle(`${result.word}`)
			.setDescription(`${result.definition}`)
			.setFooter(`Example: ${result.example}`);
		interaction.editReply({ embeds: [embed] });
	} else {
		const embed = new MessageEmbed()
			.setTitle('Error Getting Word')
			.setDescription('Maybe it doesnt exist on UD?');
		interaction.editReply({ embeds: [embed] });
	}
}
