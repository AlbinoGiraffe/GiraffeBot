const color = require('colors/safe');
const { MessageEmbed, Permissions } = require('discord.js');
const config = require('../config.json');

module.exports = async (client, reaction) => {
	// resolve partial
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}

	const token = client.db.GuildConfig.findOne({
		where: { guildId: reaction.message.guild.id },
	});

	let thresh;
	if (!token) {
		thresh = config.defaultReactionThreshold;
	}

	thresh = await getThresh(client, reaction, 'pin');
	if (reaction.emoji.toString() == '📌' && reaction.count >= thresh) {
		reaction.message.pin().catch(console.error);
	}

	thresh = await getThresh(client, reaction, 'star');
	if (reaction.emoji.toString() == '⭐' && reaction.count >= thresh) {
		// starboard
		if (!reaction.message.guild) return;

		// make sure board exists for server
		const board = await client.db.GuildConfig.findOne({
			where: { guildId: reaction.message.guild.id },
		});

		if (!board) return;
		if (!board.starBoardChannelId) return;
		if (reaction.message.channel.id == board.starBoardChannelId) return;

		// make sure it is a public channel
		const everyone = reaction.message.guild.roles.everyone;
		if (
			!reaction.message.channel
				.permissionsFor(everyone)
				.has(Permissions.FLAGS.VIEW_CHANNEL)
		) {
			return;
		}

		// if in board
		const inStarboard = await client.db.Starboard.findOne({
			where: { messageId: reaction.message.id },
		});

		if (!board.starBoardChannelId) return;

		if (inStarboard) {
			// if exists in board, update it
			// console.log(inStarboard);
			const boardChannel = await reaction.message.guild.channels.fetch(
				board.starBoardChannelId,
			);
			boardChannel.messages
				.fetch(inStarboard.boardId)
				.then((m) => m.edit({ embeds: [getEmbed(reaction)] }))
				.catch((e) => console.log(color.red(`Error: ${e.message}`)));
		} else {
			// add to board

			reaction.message.guild.channels
				.fetch(board.starBoardChannelId)
				.then((c) => {
					c.send({ embeds: [getEmbed(reaction)] })
						.then((m) => {
							// update starboard table with message id and board id
							client.db.Starboard.create({
								guildId: reaction.message.guild.id,
								messageId: reaction.message.id,
								boardId: m.id,
							});
						})
						.catch(console.error);
				})
				.catch((e) => console.log(color.red(`Error: ${e}`)));
		}
	}
	return;
};

function getEmbed(reaction) {
	// console.log(reaction.message.memner.avatarURL);
	const out = new MessageEmbed()
		.setColor('0xe74c3c')
		.setTitle(reaction.message.author.tag)
		.setThumbnail(reaction.message.member.user.avatarURL())
		.setDescription(reaction.message.content)
		.addField('Jump to Message', `[Click](${reaction.message.url})`)
		.setFooter(
			`stars: ${
				reaction.count
			} • ${reaction.message.createdAt.toLocaleString()} • #${
				reaction.message.channel.name
			}`,
		);
	return out;
}

async function getThresh(client, reaction, op) {
	const token = await client.db.GuildConfig.findOne({
		where: { guildId: reaction.message.guild.id },
	});

	if (!token) {
		return config.defaultReactionThreshold;
	}

	if (op == 'star') {
		return token.starThreshold;
	}

	if (op == 'pin') {
		return token.pinThreshold;
	}
}
