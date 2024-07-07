require("./server.js");

const uniqueId = Math.random().toString(36).slice(2);

function sendWebhook(url, msg) {
	return new Promise((resolve) => {
		try {
			fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: msg,
				}),
			}).then(() => resolve());
		} catch {
			resolve();
		}
	});
}

function getAiResponse(user, msg) {
	return new Promise((resolve) => {
		try {
			fetch(process.env.API_ENDPOINT, {
				headers: {
					accept: "text/plain",
					"accept-language": "en-US,en;q=0.9",
					"content-type": "application/json",
				},
				body: JSON.stringify({
					UserId: user,
					ConversationId: `${user}-${uniqueId}`,
					UserInput: msg,
				}),
				method: "POST",
			})
				.then((res) => res.json())
				.then((json) => resolve(json.response));
		} catch {
			resolve("...");
		}
	});
}

function bot1(reply) {
	getAiResponse(process.env.BOT1_NAME, reply)
		.then((res) => {
			sendWebhook(process.env.BOT1_WEBHOOK, res)
				.then(() => {
					setTimeout(() => {
						bot2(res);
					}, 2000);
				})
				.catch(() => {
					bot2("...");
				});
		})
		.catch(() => {
			bot2("...");
		});
}

function bot2(reply) {
	getAiResponse(process.env.BOT2_NAME, reply)
		.then((res) => {
			sendWebhook(process.env.BOT2_WEBHOOK, res)
				.then(() => {
					setTimeout(() => {
						bot1(res);
					}, 2000);
				})
				.catch(() => {
					bot1("...");
				});
		})
		.catch(() => {
			bot1("...");
		});
}

bot1("hello");
