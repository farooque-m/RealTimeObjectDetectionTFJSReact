const TOKEN = 'token';
const AUTH_TIME = 'authTime';

export const getToken = () => window.localStorage.getItem(TOKEN);
export const setToken = (token) => window.localStorage.setItem(TOKEN, token);
export const removeToken = () => window.localStorage.removeItem(TOKEN);

export const getAuthTime = () => window.localStorage.getItem(AUTH_TIME);
export const setAuthTime = (authTime) => window.localStorage.setItem(AUTH_TIME, authTime);
export const removeAuthTime = () => window.localStorage.removeItem(AUTH_TIME);