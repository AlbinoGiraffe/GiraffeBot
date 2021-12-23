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
	// Syncing DB
	client.Snipe.sync();
	console.log(color.yellow('Database synced'));

	if (!client.application?.owner) client.application?.fetch();

	if (!config.globalCommands) {
		client.guilds.cache
			.map((g) => g)
			.forEach((guild) => {
				try {
					count++;
					guild?.commands
						.fetch()
						.then((guildCommands) => {
							if (guildCommands) {
								guildCommands.forEach((c) => {
									if (client.adminSlashCommands.includes(c.name)) {
										c.permissions.add({ permissions: adminPermissions });
									}
								});
							}
						})
						.catch((e) => console.log(e));
					guild.commands.set(client.slash).catch((e) => console.log(e));
				} catch (e) {
					console.log(String(e));
				}
			});
		console.log(color.yellow(`Set commands/permissions for ${count} guilds`));

		const stop = Date.now();
		console.log(
			color.green(
				`Ready! Logged in as ${client.user.tag} in ${
					(stop - client.startupTime) / 1000
				}s`,
			),
		);
	}
};
