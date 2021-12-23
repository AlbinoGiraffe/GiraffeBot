const color = require('colors/safe');
const botUtils = require('../botUtils');

module.exports = (client, message) => {
	if (message.author.bot) return;

	console.log(color.blue('message deleted'));
	// create or update entry
	botUtils.entryExists(client, message).then((exists) => {
		console.log(exists);
		if (!exists) {
			client.Snipe.create({
				channelId: message.channel.id,
				content: message.content,
				author: message.author.user,
				date: message.createdAt.toLocaleDateString(),
				mid: message.id,
			})
				.then(() => {
					console.log(color.blue(`Snipe entry added`));
				})
				.catch((e) => console.log(e));
		} else {
			client.Snipe.update(
				{
					content: message.content,
					author: message.author.user,
					date: message.createdAt.toLocaleDateString(),
					mid: message.id,
				},
				{ where: { channelId: message.channel.id } },
			)
				.then(() => {
					console.log('Updated snipe message');
					// delete it after 5 seconds
					setTimeout(
						() =>
							client.Snipe.destroy({
								where: { channelId: message.channel.id },
							}).then(() => message.channel.send('Snipe destroyed')),
						5000,
					);
				})
				.catch((e) => console.log(e));
		}
	});
};
