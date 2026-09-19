const store = $store(
	{
		url: "https://google.com",
		wispurl:
			_CONFIG?.wispurl ||
			(location.protocol === "https:" ? "wss" : "ws") +
				"://" +
				location.host +
				"/wisp/",
		bareurl:
			_CONFIG?.bareurl ||
			(location.protocol === "https:" ? "https" : "http") +
				"://" +
				location.host +
				"/bare/",
		proxy: "",
		backend: "scramjet",
		backendSet: false,
		transport: "/epoxy/index.mjs",
	},
	{ ident: "settings", backing: "localstorage", autosave: "auto" }
);
self.store = store;

if (store.backend !== "scramjet" && store.backend !== "gammaray") {
	store.backend = "scramjet";
}

// Force reset to Scramjet if corrupted state detected
if (store.transport?.includes("gammaray") && !store.backend) {
	store.backend = "scramjet";
	store.transport = "/epoxy/index.mjs";
	store.backendSet = false;
}

if (store.backend === "gammaray") {
	const allowedGammarayTransports = new Set([
		"/uv/bare.transport.mjs",
		"/uv/epoxy.transport.mjs",
	]);

	if (!allowedGammarayTransports.has(store.transport)) {
		store.transport = "/uv/bare.transport.mjs";
	}

	if (typeof store.bareurl !== "string" || !store.bareurl.trim()) {
		store.bareurl =
			(location.protocol === "https:" ? "https" : "http") +
			"://" +
			location.host +
			"/bare/";
	}
}

if (store.backend === "scramjet") {
	const allowedScramjetTransports = new Set([
		"/epoxy/index.mjs",
		"/libcurl/index.mjs",
		"/baremod/index.mjs",
	]);

	if (!allowedScramjetTransports.has(store.transport)) {
		store.transport = "/epoxy/index.mjs";
	}
}

