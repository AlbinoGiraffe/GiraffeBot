const config = require('./config.json');

module.exports = (client) => {
	process.on('unhandledRejection', (reason, p) => {
		console.log('[antiCrash] :: Unhandled Rejection/Catch');
		console.log(reason, p);
		dmOwner(client, reason, p);
		process.exit(1);
	});
	process.on('uncaughtException', (err, origin) => {
		console.log('[antiCrash] :: Uncaught Exception/Catch');
		console.log(err, origin);
		dmOwner(client, err, origin);
		process.exit(1);
	});
	process.on('uncaughtExceptionMonitor', (err, origin) => {
		console.log('[antiCrash] :: Uncaught Exception/Catch (MONITOR)');
		console.log(err, origin);
		dmOwner(client, err, origin);
		process.exit(1);
	});
};

function dmOwner(client, err, p, r = '') {
	client.users.fetch(config.adminId).then((c) => {
		c.send(`ERROR:\n${err}\n${p}\n${r}`);
	});
}
