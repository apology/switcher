class Switcher {
	constructor() {
		this.state = {
			tabs: [],
			filtered: [],
			selected: 0,
			query: '',
		}

		this.populate();
		this.bind();
	}

	populate() {
		chrome.tabs.query({}, (tabs) => {
			tabs = tabs.filter(t => t.url !== window.location.href);
			const filtered = this.filter(tabs, this.state.query);
			this.update({ tabs, filtered });
		});
	}

	bind() {
		const input = document.getElementById('input');
		input.addEventListener('input', () => {
			const query = input.value;
			const filtered = this.filter(this.state.tabs, query);
			this.update({ query, filtered });
		});

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') close();
			if (e.key === 'Enter') {
				e.preventDefault();
				this.commit();
			}
			if (e.key === 'ArrowDown') this.update({ selected: Math.min(this.state.selected + 1, this.state.filtered.length - 1) });
			if (e.key === 'ArrowUp') this.update({ selected: Math.max(this.state.selected - 1, 0) });
		});

		chrome.windows.onFocusChanged.addListener((id) => {
			// chrome.windows.getCurrent(current => (current !== id) && close());
		});
	}

	update(next) {
		Object.keys(next).forEach(k => this.state[k] = next[k]);
		this.render();
	}

	filter(tabs, query) {
		if (!query || !query.length) return tabs;

		const scored = tabs.map(t => t);
		scored.forEach((t) => {
			t.score = fuzzy((t.title + '~' + t.url).toLowerCase(), query.toLowerCase());
		});

		return scored.filter(t => t.score > 0).sort((a, b) => b.score - a.score);
	}

	render() {
		console.log(this.state);
		const { filtered, selected } = this.state;
		const out = document.getElementById('results');
		out.innerHTML = filtered.map((t, i) => (
			`
			<div class="row ${(i === selected) ? 'selected' : ''}">
				<img class="favicon" src="${t.favIconUrl}">
				<span class="title">${t.title}</span>
				<span class="url">${t.url}</span>
			</div>
			`
		)).join('');
	}

	commit() {
		if (this.state.selected >= this.state.filtered.length) return;
		const tab = this.state.filtered[this.state.selected];

		chrome.tabs.update(tab.id, { active: true });
		chrome.windows.update(tab.windowId, { focused: true });
		this.close();
	}

	close() {
		chrome.windows.getCurrent(w => chrome.windows.remove(w.id));
	}
}

const switcher = new Switcher();
