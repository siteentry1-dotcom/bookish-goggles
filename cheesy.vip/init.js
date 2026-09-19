window.addEventListener("load", async () => {
	const root = document.getElementById("app");
	const render = /** @type {any} */ (window).h;

	if (!root) {
		throw new Error('Missing #app root element');
	}

	if (typeof render !== "function") {
		throw new Error("Dreamland renderer is not available");
	}

	try {
		await loadGameCache();
	} catch (e) {
		console.error("Failed to preload game cache:", e);
	}

	try {
		root.replaceWith(render(Dashboard));
	} catch (e) {
		root.replaceWith(document.createTextNode("" + e));
		throw e;
	}

	try {
		const router = /** @type {any} */ (window).tcpDashboardRouter;
		if (router && typeof router.handleRouteChange === "function") {
			await router.handleRouteChange();
		}
	} catch (e) {
		console.error("Failed to handle initial route:", e);
	}

	try {
		const arraybuffer = await (
			await fetch("./assets/scramjet.png")
		).arrayBuffer();
		let binary = "";
		const bytes = new Uint8Array(arraybuffer);
		const len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		console.log(
			"%cb",
			`
			background-image: url(data:image/png;base64,${btoa(binary)});
			color: transparent;
			padding-left: 200px;
			padding-bottom: 100px;
			background-size: contain;
			background-position: center center;
			background-repeat: no-repeat;
		`
		);
	} catch (e) {
		console.log("The Cheesy Proxy - Built on top of Scramjet");
	}
});
