const SESSION_HEADER_NAME = 'x-sm-affinity';
const SESSION_IDS_STORAGE_KEY = 'sm-affinity';

const loadSessionIds = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_IDS_STORAGE_KEY) || '{}');
  } catch (_) {
    return {};
  }
};

const getSessionId = (url: string) => {
  const u = new URL(url);
  const keys = loadSessionIds();
  if (!keys || !keys[u.hostname]) {
    return null;
  }
  return keys[u.hostname];
};

const setSessionId = (url: string, sessionId: string) => {
  const u = new URL(url);
  const keys = loadSessionIds();
  keys[u.hostname] = sessionId;
  localStorage.setItem(SESSION_IDS_STORAGE_KEY, JSON.stringify(keys));
  return keys;
};

export default (url: string, options?: RequestInit) => {
  const sessionHeader = getSessionId(url);
  const reqOptions = sessionHeader
    ? {
        ...options,
        headers: {
          ...options?.headers,
          [SESSION_HEADER_NAME]: sessionHeader,
        },
      }
    : options;

  return fetch(url, reqOptions).then((r) => {
    const sessionId = r.headers.get(SESSION_HEADER_NAME);
    if (sessionId) {
      setSessionId(url, sessionId);
    }
    return r;
  });
};
