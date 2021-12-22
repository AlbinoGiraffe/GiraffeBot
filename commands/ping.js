const color = require('colors/safe');

module.exports = {
	name: 'ping',
	run: (client, message) => {
		try {
			message.reply(`Pong! (${client.ws.ping}ms)`);
		} catch (e) {
			console.log(color.red(e));
		}
	},
};
