const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 's',
	description: 'Snipe a deleted message',
	help: 'Usage: `s`',
	run: (client, message) => {
		client.db.Snipe.findOne({ where: { channelId: message.channel.id } }).then(
			(token) => {
				if (token === null) {
					message.channel.send(`No message to snipe!`);
				} else {
					message.channel
						.send({ embeds: [genEmbed(client, token, message)] })
						.catch();
				}
			},
		);
	},
};

function genEmbed(client, token, message) {
	const out = new MessageEmbed()
		.setColor('0xe74c3c')
		.setTitle(`Deleted message from ${token.author}`)
		.addField('Message: ', token.content)
		.setFooter({
			text: `id: ${token.mid} | ${token.date} | #${message.channel.name}`,
		});
	return out;
}
