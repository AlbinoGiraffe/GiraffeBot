module.exports = {
	name: 's',
	run: (client, message) => {
		client.Snipe.findOne({ where: { channelId: message.channel.id } }).then(
			(token) => {
				if (token === null) {
					message.channel.send(`No message to snipe!`);
				} else {
					message.channel.send(`Sniped: ${token.content}`);
				}
			},
		);
	},
};
