const WIDTH = 600, HEIGHT = 800;

chrome.commands.onCommand.addListener((command) => {
	if (command !== 'open') return;

	chrome.system.display.getInfo((displays) => {
		const bounds = displays.filter(d => d.isPrimary)[0].bounds;

		chrome.tabs.query({ url: chrome.extension.getURL('switcher.html') }, (tabs) => {
			if (tabs.length) return;

			chrome.windows.create({
				url: chrome.extension.getURL('switcher.html'),
				width: WIDTH,
				height: HEIGHT,
				top: bounds.height / 2 - HEIGHT / 2,
				left: bounds.width / 2 - WIDTH / 2,
				type: 'popup',
			});
		});
	});
});
