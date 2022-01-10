const color = require('colors/safe');

module.exports = {
	name: 'iamnot',
	description: 'Remove a role from yourself',
	run: (client, message, args) => {
		// find role
		// remove role from user

		message.reply('done').catch((e) => console.log(color.red(e)));
	},
};
