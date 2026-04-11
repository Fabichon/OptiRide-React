// Ensure FormData exists at runtime before other modules execute.
if (typeof globalThis.FormData === 'undefined') {
  try {
    const ExpoFetchFormData = require('expo/fetch').FormData;
    if (ExpoFetchFormData) {
      globalThis.FormData = ExpoFetchFormData as typeof globalThis.FormData;
    }
  } catch {
    // Fall through to RN fallback.
  }

  if (typeof globalThis.FormData === 'undefined') {
  try {
    const RNFormData = require('react-native/Libraries/Network/FormData').default;
    if (RNFormData) {
      globalThis.FormData = RNFormData as typeof globalThis.FormData;
    }
  } catch {
    // Keep startup resilient even if internal RN path changes.
  }
  }
}

// Ensure WebSocket exists at runtime before other modules execute.
if (typeof globalThis.WebSocket === 'undefined') {
  try {
    const RNWebSocket = require('react-native/Libraries/WebSocket/WebSocket').default;
    if (RNWebSocket) {
      globalThis.WebSocket = RNWebSocket as typeof globalThis.WebSocket;
    }
  } catch {
    // Keep startup resilient even if internal RN path changes.
  }
}
