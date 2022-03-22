const color = require('colors/safe');
const botUtils = require('../botUtils');

module.exports = async (client, message) => {
	if (message.partial) return;
	if (message.author.bot || !message.guild) return;
	if (client.ignoreList.includes(message.channel.id)) return;

	await processCounter(client, message);

	console.log(
		color.blue(
			`[${new Date().toLocaleString()}]: Deleted - ${message.author.tag} in #${
				message.channel.name
			}: ${botUtils.truncate(message.content)}`,
		),
	);

	// Create snipe entry
	botUtils.entryExists(client, message).then((exists) => {
		if (!exists) {
			client.db.Snipe.create({
				channelId: message.channel.id,
				content: message.content,
				author: message.author.tag,
				date: message.createdAt.toLocaleString(),
				mid: message.id,
			})
				.then(() => {
					console.log(
						color.blue(
							`[${new Date().toLocaleString()}]: Snipe entry added for #${
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
										`[${new Date().toLocaleString()}]: Snipe entry deleted for #${
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

async function processCounter(client, message) {
	const tok = await client.db.Count.findOne({
		where: { guildId: message.guild.id },
	});

	if (!tok) return;
	if (!tok.channelId || !tok.lastNumber) return;
	if (!(tok.channelId == message.channel.id)) return;

	const numberMatch = message.content.match(/^([1-9]\d*)/);

	if (numberMatch && parseInt(numberMatch[1], 10) == tok.lastNumber) {
		message.channel.send(numberMatch[1]);
	}
}
