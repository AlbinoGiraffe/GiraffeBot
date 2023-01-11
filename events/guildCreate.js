const config = require('../config.json');

module.exports = async (client, guild_in) => {
	console.log(`${client.user.username} joined ${guild_in.name}`);
	console.log(`Checking for existing config...`);

	for (const guild of client.guilds.cache.map((g) => g)) {
		// update guild config in database
		const token = await client.db.GuildConfig.findOne({
			where: { guildId: guild.id },
		});

		if (!token) {
			console.log(`Creating config for ${guild_in.name}`);
			await client.db.GuildConfig.create({
				guildName: guild.name,
				guildId: guild.id,
				prefix: config.prefix,
				adminRoles: '',
				modRoles: '',
				ownerId: config.adminId,
			});
		}
	}

	return;
};
