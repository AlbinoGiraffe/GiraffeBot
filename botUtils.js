const { Collection } = require('discord.js');

module.exports = {
	cleanInput: function (input) {
		return input.replace('@everyone', '@\u200beveryone');
	},
	fetchMore: async function (channel, limit = 250) {
		if (!channel) {
			throw new Error(`Expected channel, got ${typeof channel}.`);
		}
		if (limit <= 100) {
			return channel.messages.fetch({ limit });
		}

		let collection = new Collection();
		let lastId = null;
		let remaining = limit;
		const options = {};

		while (remaining > 0) {
			options.limit = remaining > 100 ? 100 : remaining;
			remaining = remaining > 100 ? remaining - 100 : 0;

			if (lastId) {
				options.before = lastId;
			}

			const messages = await channel.messages.fetch(options);

			if (!messages.last()) {
				break;
			}

			collection = collection.concat(messages);
			lastId = messages.last().id;
		}

		return collection;
	},
	entryExists: function (client, message) {
		return client.Snipe.findOne({
			where: { channelId: message.channel.id },
		}).then((token) => token !== null);
	},
	truncate: function (str, num = 50) {
		if (str.length <= num) {
			return str;
		}
		return str.slice(0, num) + '...';
	},
};
