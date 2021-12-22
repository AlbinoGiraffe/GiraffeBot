const { githubLink } = require('../config.json');

module.exports = {
	name: 's',
	run: (client, message) => {
		message.channel.send(githubLink);
	},
};
