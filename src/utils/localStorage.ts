export const saveToLocalStorage = <T = Record<string, unknown>>(
  key: string,
  data: T
) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const loadFromLocalStorage = <T = Record<string, unknown>>(
  key: string
): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const removeFromLocalStorage = (key: string) =>
  localStorage.removeItem(key);
