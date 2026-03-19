if (typeof globalThis.FormData === 'undefined') {
	class BootstrapFormData {}
	globalThis.FormData = BootstrapFormData as typeof globalThis.FormData;
}

if (typeof globalThis.WebSocket === 'undefined') {
	class BootstrapWebSocket {
		static CONNECTING = 0;
		static OPEN = 1;
		static CLOSING = 2;
		static CLOSED = 3;
	}
	globalThis.WebSocket = BootstrapWebSocket as typeof globalThis.WebSocket;
}

if (typeof globalThis.queueMicrotask === 'undefined') {
	globalThis.queueMicrotask = ((callback: VoidFunction) => {
		Promise.resolve()
			.then(callback)
			.catch((error) => {
				setTimeout(() => {
					throw error;
				}, 0);
			});
	}) as typeof globalThis.queueMicrotask;
}

require('./src/polyfills/formData');

const { registerRootComponent } = require('expo');
const App = require('./App').default;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
