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
			client.clev
				.query(cbquery)
				.then((response) => {
					message.reply(response.output);
				})
				.catch(console.error);
		}
	},
};
