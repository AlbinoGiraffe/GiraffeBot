const config = require('../config.json');
const botUtils = require('../botUtils');

module.exports = {
	name: 'codes',
	description: 'Get a list of major codes',
	help: "Usage: `codes` (DM's you a list of major codes)",
	run: async (client, message) => {
		if (!(await botUtils.isSelectorChannel(client, message))) return;

		client.db.Majors.findAll().then((major) => {
			let out = '';
			major.forEach((m) => {
				out = out + `${m.major} - ${m.code}\n`;
			});

			if (message.author.id != config.adminId) {
				message.author.createDM().then((dm) => dm.send(`\`\`\`${out}\`\`\``));
			} else {
				message.channel.send(`\`\`\`${out}\`\`\``);
			}
		});
	},
};
