const color = require('colors/safe');

module.exports = {
	name: 'iam',
	description: 'Give yourself a role',
	run: (client, message, args) => {
		// find role
		// get list from db
		// check if role id in list
		// assign role if assignable

		message.reply('done').catch((e) => console.log(color.red(e)));
	},
};
