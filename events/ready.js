const color = require('colors/safe');
const botUtils = require('../botUtils');
const config = require('../config.json');

const adminPermissions = [
	{
		id: config.adminId,
		type: 'USER',
		permission: true,
	},
];

module.exports = async (client) => {
	let count = 0;
	if (!client.application?.owner) client.application?.fetch();

	client.ignoreList = await botUtils.getIgnoreList(client);

	if (!config.globalCommands) {
		client.guilds.cache
			.map((g) => g)
			.forEach((guild) => {
				count++;
				// update guild config in database
				client.db.GuildConfig.findOne({ where: { guildId: guild.id } })
					.then((token) => {
						if (!token) {
							client.db.GuildConfig.create({
								guildName: guild.name,
								guildId: guild.id,
								prefix: config.prefix,
								adminRoles: '',
								modRoles: '',
								ownerId: config.adminId,
							});
						}
					})
					.then(() => {
						// update permissions
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
							.catch(console.error);
					})
					.catch((e) => console.log(e));
				guild.commands.set(client.slash).catch((e) => console.log(e));
			});
		// set slash commands
	}
	console.log(
		color.yellow(`Set commands/permissions/config for ${count} guilds`),
	);

	const stop = Date.now();
	console.log(
		color.green(
			`Ready! Logged in as ${client.user.tag} in ${
				(stop - client.startupTime) / 1000
			}s`,
		),
	);
};
