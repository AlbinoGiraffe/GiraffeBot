const { githubLink } = require('../config.json');

module.exports = {
	name: 'github',
	run: (client, message) => {
		message.channel.send(githubLink);
	},
};
