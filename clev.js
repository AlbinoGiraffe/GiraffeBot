module.exports = {
	init: async function (apikey) {
		console.log('Init Cleverbot API Wrapper');
		const Cleverbot = (await import('@faurinfox/cleverbot')).default;
		return new Cleverbot({ key: apikey });
	},
	query: async function (client, clev, input, uid) {
		if (clev === undefined) {
			console.log('Cleverbot unavailable!');
			return;
		}

		const csStr = await this.getUserCS(client, uid);

		let r = undefined;
		const out = await clev.then((c) => c);
		out.setTweak('wackiness', 70);
		out.setTweak('talkativeness', 80);
		out.setTweak('attentiveness', 60);

		if (csStr !== undefined) {
			r = await out.query(input, { cs: csStr });
		} else {
			r = await out.query(input);
		}

		this.updateDB(client, uid, r.cs);
		return r;

		// clev.then((c) => {
		// 	c.query(input)
		// 		.then((r) => {
		// 			console.log(r.output);
		// 			return r;
		// 		})
		// 		.catch((e) => console.log(e));
		// });
	},
	getUserCS: async function (client, uid) {
		const token = await client.db.Cleverbot.findOne({ where: { userid: uid } });
		if (!token) {
			return undefined;
		} else {
			return token.csStr;
		}
	},
	updateDB: async function (client, uid, cs) {
		const token = await client.db.Cleverbot.findOne({ where: { userid: uid } });
		if (!token) {
			await client.db.Cleverbot.create({
				csStr: cs,
				userid: uid,
			});
		} else {
			await client.db.Cleverbot.update(
				{
					csStr: cs,
				},
				{ where: { userid: uid } },
			);
		}
	},
};
