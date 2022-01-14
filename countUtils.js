module.exports = {
	updateHighestCounterRole: async function (
		TOTAL_COUNTS,
		highestCounter,
		HIGHEST_COUNTER_ROLE,
	) {
		const highestCount = TOTAL_COUNTS[highestCounter.id];
		if (highestCount % 100 === 0) {
			await HIGHEST_COUNTER_ROLE.setName(
				`Highest Counter (${(highestCount / 1000).toFixed(1)}k)`,
			);
		}
	},
	reactDeleteMute: async function (
		msg,
		length = 0,
		emojis = [],
		COUNTING_MUTE_ROLE,
	) {
		for (let i = 0; i < emojis.length; i++) {
			setTimeout(() => {
				msg
					.react(emojis[i])
					.catch((err) =>
						console.error('Error sending reactDeleteMute reactions', err),
					);
			}, i * 1200);
		}

		setTimeout(() => {
			if (!msg.deleted) msg.delete().catch((err) => console.error(err));
		}, Math.max(500, emojis.length * 1200));

		if (length) {
			await msg.member.roles.add(COUNTING_MUTE_ROLE);
			setTimeout(() => {
				msg.member.roles
					.remove(COUNTING_MUTE_ROLE)
					.catch((err) =>
						console.error('Error removing counting mute role', err),
					);
			}, length);
		}
	},
};
