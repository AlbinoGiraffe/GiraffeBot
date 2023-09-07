const Cleverbot = require('../clev.js');

module.exports = {
	name: 'gb',
	description: 'Talk to me!',
	help: 'Usage: `gb query`',
	run: (client, message) => {
		const cbquery = message.cleanContent
			.replace(/.gb /, '')
			.replaceAll('@', '')
			.replaceAll('\u200B', '')
			.replaceAll(client.user.username, '');

		console.log(`Query: ${cbquery}`);

		if (cbquery) {
			const response = Cleverbot.query(
				client,
				client.clev,
				cbquery,
				message.author.id,
			);
			response
				.then((r) => {
					message.reply(r.output);
				})
				.catch();
		}
	},
};
