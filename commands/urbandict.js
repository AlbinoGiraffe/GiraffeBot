const { MessageEmbed } = require('discord.js');
const ud = require('urban-dictionary');

module.exports = {
	name: 'ud',
	run: (client, message, args) => {
		urban(message, args);
	},
};

function urban(message, args) {
	ud.define(args.join())
		.then((results) => {
			sendEmbed(message, results[0], false);
		})
		.catch((error) => {
			sendEmbed(message, null, true);
			// message.channel.send('Error getting word!');
			console.error(`urban-dictionary error: ${error.message}`);
		});
}

function sendEmbed(message, result, error) {
	if (!error) {
		const embed = new MessageEmbed()
			.setColor('0xe74c3c')
			.setTitle(`${result.word}`)
			.setDescription(`${result.definition}`)
			.setFooter(`Example: ${result.example}`);
		message.channel.send({ embeds: [embed] });
	} else {
		const embed = new MessageEmbed()
			.setTitle('Error Getting Word')
			.setDescription('Maybe it doesnt exist on UD?');
		message.channel.send({ embeds: [embed] });
	}
}
