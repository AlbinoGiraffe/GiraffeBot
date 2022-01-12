const color = require('colors/safe');

module.exports = {
	name: 'help',
	description: 'Get command help',
	run: (client, message, args) => {
		// find role
		// get list from db
		// check if role id in list
		// assign role if assignable

		message.reply(`done - ${args}`).catch((e) => console.log(color.red(e)));
	},
};
