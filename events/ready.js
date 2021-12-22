const color = require('colors/safe');
const config = require('../config.json');

const adminPermissions = [
	{
		id: config.adminId,
		type: 'USER',
		permission: true,
	},
];
let count = 0;

module.exports = async (client) => {
	if (!config.globalCommands) {
		client.guilds.cache
			.map((g) => g)
			.forEach((guild) => {
				try {
					count++;
					guild.commands.set(client.slash).catch((e) => console.log(e));
				} catch (e) {
					console.log(String(e));
				}
			});
		console.log(color.yellow(`Set commands for ${count} guilds`));
	}

	// Setting Permisssions
	count = 0;
	if (!client.application?.owner) client.application?.fetch();

	const guildCommands = await client.guilds.cache
		.get(config.guildId)
		?.commands.fetch();

	if (guildCommands) {
		guildCommands.forEach((c) => {
			if (client.adminSlashCommands.includes(c.name)) {
				c.permissions.add({ permissions: adminPermissions });
			}
			count++;
		});
	}
	console.log(color.yellow(`Set permissions for ${count} admin commands`));

	const stop = Date.now();
	console.log(
		color.green(
			`Ready! Logged in as ${client.user.tag} in ${
				(stop - client.startupTime) / 1000
			}s`,
		),
	);
};
