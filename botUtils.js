const { Collection } = require('discord.js');
const config = require('./config.json');

module.exports = {
	cleanInput: function (input) {
		let msg = input.replace('@everyone', '@\u200beveryone');
		msg = msg.replace('@here', '@\u200bhere');
		return msg;
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
		return client.db.Snipe.findOne({
			where: { channelId: message.channel.id },
		}).then((token) => token !== null);
	},
	truncate: function (str, num = 1000) {
		if (str.length <= num) {
			return str;
		}
		return str.slice(0, num) + '...';
	},
	getIgnoreList: async function (client) {
		return await client.db.GuildConfig.findAll({ where: {} }).then((e) => {
			let arr = [];
			e.forEach((g) => {
				arr = arr.concat(JSON.parse(g.ignoredChannels));
			});
			return arr;
		});
	},
	isSelectorChannel: async function (client, message) {
		if (!message.guild) return true;

		const token = await client.db.GuildConfig.findOne({
			where: { guildId: message.guild.id },
		});

		if (!token) return null;
		if (!token.selectorId) return null;
		if (token.selectorId == message.channel.id) return true;
	},
	dateTime: function () {
		const now = new Date();
		return (
			now.getDate() +
			'/' +
			(now.getMonth() + 1) +
			'/' +
			now.getFullYear() +
			' @ ' +
			now.getHours() +
			':' +
			now.getMinutes() +
			':' +
			now.getSeconds()
		);
	},
	findRoles: function (guildRoles, roleQuery) {
		return guildRoles.filter(
			(r) =>
				r.name.toUpperCase() == roleQuery.toUpperCase() ||
				r.id == parseInt(roleQuery),
		);
	},
};
