const color = require('colors/safe');

module.exports = {
	name: '',
	description: '',
	run: (client, message) => {
		message.reply('done').catch((e) => console.log(color.red(e)));
	},
};
