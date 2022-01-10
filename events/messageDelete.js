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

	// Create snipe entry
	botUtils.entryExists(client, message).then((exists) => {
		if (!exists) {
			client.db.Snipe.create({
				channelId: message.channel.id,
				content: message.content,
				author: message.author.tag,
				date: message.createdAt.toLocaleDateString(),
				mid: message.id,
			})
				.then(() => {
					console.log(
						color.blue(
							`[${new Date().toLocaleDateString()}]: Snipe entry added for #${
								message.channel.name
							}`,
						),
					);
					setTimeout(
						() =>
							client.db.Snipe.destroy({
								where: { channelId: message.channel.id },
							}).then(() =>
								console.log(
									color.blue(
										`[${new Date().toLocaleDateString()}]: Snipe entry deleted for #${
											message.channel.name
										}`,
									),
								),
							),
						8000,
					);
				})
				.catch((e) => console.log(e));
		}
	});
};
