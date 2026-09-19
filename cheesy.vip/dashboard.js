let gameCache = null;

function generateGameTag(game) {
	return typeof game?.tag === "string" ? game.tag.toLowerCase().trim() : "";
}

async function loadGameCache() {
	if (gameCache) return gameCache;
	try {
		const response = await fetch("./g.json");
		const games = await response.json();
		gameCache = games;
		return games;
	} catch (error) {
		console.error("Failed to load game cache:", error);
		return [];
	}
}

async function findGameBySlug(query) {
	const games = await loadGameCache();
	if (!games.length) return null;

	const normalizedQuery = query.toLowerCase().trim();

	for (const game of games) {
		if (generateGameTag(game) === normalizedQuery) {
			return game;
		}
	}

	return null;
}


function parseRoute() {
	const hash = location.hash.slice(1).toLowerCase().trim();

	if (!hash || hash === "") {
		return { type: "view", value: "landing" };
	}

	if (hash === "g" || hash === "geimz") {
		return { type: "view", value: "geimz" };
	}

	if (hash.startsWith("g/")) {
		return { type: "game", value: hash.slice(2) };
	}

	const routeMap = {
		p: { type: "view", value: "ˈprɒksi" },
		settings: { type: "view", value: "settings" },
		tools: { type: "view", value: "tools" },
		dis: { type: "view", value: "discord" },
	};

	if (routeMap[hash]) {
		return routeMap[hash];
	}

	return { type: "game", value: hash };
}


function updateHash(view, routeType = "view") {
	if (routeType === "view") {
		const hashMap = {
			landing: "",
			ˈprɒksi: "p",
			settings: "settings",
			tools: "tools",
			discord: "dis",
			geimz: "g",
		};
		const hash = hashMap[view] || "";
		if (view === "landing") {
			if (location.hash) {
				window.history.replaceState(
					null,
					"",
					`${location.pathname}${location.search}`
				);
			}
		} else if (location.hash !== `#${hash}`) {
			window.history.replaceState(null, "", `#${hash}`);
		}
	} else if (routeType === "game") {
		const tag = typeof view === "string" ? view.toLowerCase().trim() : "";
		if (tag && location.hash !== `#g/${tag}`) {
			window.history.replaceState(null, "", `#g/${tag}`);
		}
	}
}

function Dashboard() {
	this.css = `
    width: 100vw;
    height: 100vh;
    display: flex;
    background-color: #0a0a0a;
    color: #e0def4;
    overflow: hidden;

    .sidebar {
      position: fixed;
      bottom: 2em;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      height: auto;
      background: rgba(26, 26, 26, 0.85);
      border: 3px solid #ffa500;
      border-radius: 1.5em;
      backdrop-filter: blur(9px);
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      padding: 1em;
      box-shadow: 0 8px 32px rgba(255, 140, 0, 0.29);
      z-index: 10000;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .sidebar.hidden {
      opacity: 0;
      transform: translateX(-50%) translateY(100px);
      pointer-events: none;
    }

    .icon-btn {
      width: 65px;
      height: 65px;
      background-color: #1a1a1a;
      border-radius: 0.8rem;
      color: #fff;
      font-size: 2rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 0;
    }

    .icon-btn img {
      width: 40px;
      height: 40px;
      filter: brightness(0) saturate(100%) invert(100%);
      transition: filter 0.2s ease;
    }

    .icon-btn:hover img {
      filter: brightness(0) saturate(100%) invert(65%) sepia(85%) saturate(1500%) hue-rotate(0deg) brightness(100%);
    }

    .icon-btn.active img {
      filter: brightness(0) saturate(100%) invert(100%);
    }

    .icon-btn:hover {
      background: linear-gradient(135deg, rgba(255, 140, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%);
      border-color: #ff8c00;
      box-shadow: 0 0 16px rgba(255, 140, 0, 0.4);
      transform: scale(1.05);
    }

    .icon-btn.active {
      background: linear-gradient(135deg, #ff8c00 0%, #ffa500 100%);
      border-color: #ffa500;
      box-shadow: 0 0 20px rgba(255, 140, 0, 0.6);
    }

    .icon-btn-tooltip {
      position: absolute;
      bottom: 75px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(26, 26, 26, 0.95);
      border: 3px solid #ff8c00;
      border-radius: 0.4rem;
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }

    .icon-btn:hover .icon-btn-tooltip {
      opacity: 1;
    }

    .main-content {
      flex: 1;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .content-area {
      flex: 1;
      overflow: hidden;
      padding: 0;
      display: flex;
      position: relative;
    }

    .content-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .loading-screen {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #0a0a0a;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      opacity: 1;
      transition: opacity 0.3s ease;
    }

    .loading-screen.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .loading-spinner {
      width: 100px;
      height: 100px;
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .landing-container {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      padding: 3rem 2rem;
    }

    .landing-container h1 {
      font-size: 4rem;
      font-weight: 800;
      background: linear-gradient(135deg, #ff8c00 0%, #ffa500 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    .landing-container p {
      font-size: 1.3rem;
      color: #999;
      margin-bottom: 2.5rem;
      line-height: 1.6;
    }

    .ˈprɒksi-btn {
      padding: 1.2rem 3rem;
      background: linear-gradient(135deg, #ff8c00 0%, #ffa500 100%);
      border: none;
      border-radius: 0.6rem;
      color: #fff;
      font-size: 1.2rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
      box-shadow: 0 4px 20px rgba(255, 140, 0, 0.4);
    }

    .ˈprɒksi-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(255, 140, 0, 0.6);
    }

    .ˈprɒksi-btn:active {
      transform: translateY(-1px);
    }

    .settings-container {
      max-width: 600px;
    }

    .settings-container h2 {
      color: #ff8c00;
      margin-bottom: 2rem;
      font-size: 2rem;
    }
  `;

	this.activeView = "landing";
	this.currentGameSlug = null;

	window.addEventListener("message", (event) => {
		console.log("Message received:", event.data);
		if (
			event.data &&
			(event.data.type === "gameOpened" || event.data.type === "geimOpened")
		) {
			console.log("Game opened, hiding sidebar");
			const sidebar = document.querySelector(".sidebar");
			if (sidebar) {
				sidebar.classList.add("hidden");
			}
			if (event.data.gameTag) {
				updateHash(event.data.gameTag, "game");
			}
		} else if (
			event.data &&
			(event.data.type === "gameClosed" || event.data.type === "geimClosed")
		) {
			console.log("Game closed, showing sidebar");
			const sidebar = document.querySelector(".sidebar");
			if (sidebar) {
				sidebar.classList.remove("hidden");
			}

			this.currentGameSlug = null;
			this.activeView = "geimz";
			updateHash("geimz", "view");
		} else if (event.data && event.data.type === "closePrɒksi") {
			console.log("Closing ˈprɒksi, show sidebar and switch to landing");
			const sidebar = document.querySelector(".sidebar");
			if (sidebar) {
				sidebar.classList.remove("hidden");
			}
			switchView("landing");
		} else if (event.data && event.data.type === "switchToPrɒksi") {
			console.log("Switching to ˈprɒksi view");
			switchView("ˈprɒksi");
		}
	});

	const switchView = (view) => {
		const iframe = document.querySelector(".content-iframe");
		if (view === this.activeView && iframe) {
			const currentSrc = iframe.getAttribute("src") || "";
			if (view === "geimz" && currentSrc.includes("/g.html")) {
				updateHash(view, "view");
				const sidebar = document.querySelector(".sidebar");
				if (sidebar) {
					sidebar.classList.remove("hidden");
				}
				const loading = document.querySelector(".loading-screen");
				if (loading) {
					loading.classList.add("hidden");
				}
				return;
			}
		}

		this.activeView = view;
		const sidebar = document.querySelector(".sidebar");
		const loadingScreen = document.querySelector(".loading-screen");

		updateHash(view, "view");

		if (loadingScreen) {
			loadingScreen.classList.remove("hidden");
		}

		const hideLoadingScreen = () => {
			const loading = document.querySelector(".loading-screen");
			if (loading) {
				loading.classList.add("hidden");
			}
		};

		if (iframe) {
			iframe.removeEventListener("load", hideLoadingScreen);
			iframe.addEventListener("load", hideLoadingScreen);

			if (view === "landing") {
				iframe.src = "/dashboard.html";
				if (sidebar) {
					sidebar.classList.remove("hidden");
				}
			} else if (view === "geimz") {
				iframe.src = "/g.html";
				if (sidebar) {
					sidebar.classList.remove("hidden");
				}
			} else if (view === "tools") {
				iframe.src = "/tools.html";
				if (sidebar) {
					sidebar.classList.remove("hidden");
				}
			} else if (view === "settings") {
				iframe.src = "/settings.html";
				if (sidebar) {
					sidebar.classList.remove("hidden");
				}
			} else if (view === "discord") {
				iframe.src = "/d.html";
				if (sidebar) {
					sidebar.classList.remove("hidden");
				}
			} else if (view === "ˈprɒksi") {
				iframe.src = "/playground.html";
				if (sidebar) {
					sidebar.classList.add("hidden");
				}
			}
		}
	};

	const openGameBySlug = async (slugOrTag) => {
		const game = await findGameBySlug(slugOrTag);
		if (!game) {
			console.error(`Game not found for slug: ${slugOrTag}`);
			switchView("landing");
			return;
		}

		const gameTag = generateGameTag(game);
		if (!gameTag) {
			console.error("Game is missing a tag");
			switchView("landing");
			return;
		}
		this.currentGameSlug = gameTag;
		updateHash(gameTag, "game");

		sessionStorage.setItem("pendingGame", JSON.stringify(game));
		sessionStorage.setItem("pendingGameSlug", gameTag);

		const iframe = document.querySelector(".content-iframe");
		if (iframe) {
			iframe.src = `/g.html?autoopen=${encodeURIComponent(gameTag)}`;
		}
	};

	const handleRouteChange = async () => {
		const route = parseRoute();

		if (route.type === "view") {
			switchView(route.value);
		} else if (route.type === "game") {
			await openGameBySlug(route.value);
		}
	};

	window.addEventListener("hashchange", handleRouteChange);

	this.handleRouteChange = handleRouteChange;
	this.switchView = switchView;
	this.openGameBySlug = openGameBySlug;
	window.tcpDashboardRouter = {
		handleRouteChange,
		switchView,
		openGameBySlug,
		loadGameCache,
	};


	return html`
		<div>
			<div class="sidebar">
				<!-- Home Icon -->
				<button
					class="icon-btn ${this.activeView === "landing" ? "active" : ""}"
					on:click=${() => this.switchView("landing")}
				>
					<img
						src="/devtoolsimgs/h.svg"
						alt="Home"
						style="width: 50px; height: 50px;"
					/>
					<span class="icon-btn-tooltip">Home</span>
				</button>

				<!-- ˈprɒksi Icon -->
				<button
					class="icon-btn ${this.activeView === "ˈprɒksi" ? "active" : ""}"
					on:click=${() => this.switchView("ˈprɒksi")}
				>
					<img src="/devtoolsimgs/p.svg" alt="ˈprɒksi" />
					<span class="icon-btn-tooltip">ˈprɒksi</span>
				</button>

				<!-- geimz Icon -->
				<button
					class="icon-btn ${this.activeView === "geimz" ? "active" : ""}"
					on:click=${() => this.switchView("geimz")}
				>
					<img src="/devtoolsimgs/g.svg" alt="geimz" />
					<span class="icon-btn-tooltip">Geimz</span>
				</button>

				<!-- Tools Icon -->
				<button
					class="icon-btn ${this.activeView === "tools" ? "active" : ""}"
					on:click=${() => this.switchView("tools")}
				>
					<img src="/devtoolsimgs/t.svg" alt="Tools" />
					<span class="icon-btn-tooltip">Tools</span>
				</button>

				<!-- Settings Icon -->
				<button
					class="icon-btn ${this.activeView === "settings" ? "active" : ""}"
					on:click=${() => this.switchView("settings")}
				>
					<img src="/devtoolsimgs/s.svg" alt="Settings" />
					<span class="icon-btn-tooltip">Settings</span>
				</button>
				<!-- Discord Icon -->
				<button
					class="icon-btn ${this.activeView === "discord" ? "active" : ""}"
					on:click=${() => this.switchView("discord")}
				>
					<img src="/devtoolsimgs/dc.svg" alt="Discord" />
					<span class="icon-btn-tooltip">Discord</span>
				</button>
			</div>

			<!-- Main Content Area -->
			<div class="main-content">
				<div class="content-area">
					<div class="loading-screen hidden">
                        <img src="/devtoolsimgs/Logo-128.png" class="loading-spinner" />
					</div>
					<iframe class="content-iframe" src="/dashboard.html"></iframe>
				</div>
			</div>
		</div>
	`;
}
