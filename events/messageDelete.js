const color = require('colors/safe');
const botUtils = require('../botUtils');

module.exports = (client, message) => {
	if (message.author.bot || !message.guild) return;
	if (client.ignoreList.includes(message.channel.id)) return;

	console.log(
		color.blue(
			`[${new Date().toLocaleDateString()}]: Deleted - ${
				message.author.tag
			} in #${message.channel.name}: ${botUtils.truncate(message.content)}`,
		),
	);

	// create or update entry
	botUtils.entryExists(client, message).then((exists) => {
		if (!exists) {
			client.db.Snipe.create({
				channelId: message.channel.id,
				content: message.content,
				author: message.author.user,
				date: message.createdAt.toLocaleDateString(),
				mid: message.id,
			})
				.then(() => {
					console.log(
						color.blue(`Snipe entry added for #${message.channel.name}`),
					);
					setTimeout(
						() =>
							client.db.Snipe.destroy({
								where: { channelId: message.channel.id },
							}).then(() =>
								console.log(
									color.blue(
										`Snipe entry deleted for #${message.channel.name}`,
									),
								),
							),
						5000,
					);
				})
				.catch((e) => console.log(e));
		} else {
			client.db.Snipe.update(
				{
					content: message.content,
					author: message.author.user,
					date: message.createdAt.toLocaleDateString(),
					mid: message.id,
				},
				{ where: { channelId: message.channel.id } },
			)
				.then(() => {
					// delete it after 5 seconds
					setTimeout(
						() =>
							client.db.Snipe.destroy({
								where: { channelId: message.channel.id },
							}).then(() =>
								console.log(`Snipe destroyed for #${message.channel.name}`),
							),
						5000,
					);
				})
				.catch((e) => console.log(e));
		}
	});
};
