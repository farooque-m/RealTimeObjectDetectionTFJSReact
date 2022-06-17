import axios from "axios";
import { getAuthTime, setAuthTime, getToken, setToken } from "../localStorage/tokens";

let refreshTokenPromise = null

export const isTokenExpired = () => {
    const authTime = getAuthTime()
    const d = new Date()
    const n = d.getTime()
    return (authTime === 0 || (n - authTime) > 30 * 60 * 1000)
}

const authenticate = () => {
    const url = `https://cicd.cognetrylabsdemo.com/storemanager/authenticate`;
    const user = { username: "cognetry", password: "password" };
    return axios
        .post(url, user)
        .then((res) => res.data)
        .then((data) => {
            const d = new Date();
            const authTime = d.getTime();
            const loginToken = data.token;
            setAuthTime(authTime);
            setToken(loginToken);
            return loginToken;
        });
};

const API = axios.create();

// Request interceptor for API calls
API.interceptors.request.use(
    async (config) => {
        if (!config.url.includes("/authenticate")) {
            let token = getToken();
            if (!token || isTokenExpired()) {
                if (!refreshTokenPromise) {
                    refreshTokenPromise = authenticate().then((token) => {
                        refreshTokenPromise = null
                        return token
                    })
                }
                token = await refreshTokenPromise;
            }
            config.headers = { Authorization: `Bearer ${token}` };
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for API calls
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if ((error.response || {}).status === 403 && !originalRequest._retry) {
            originalRequest._retry = true
            if (!refreshTokenPromise) {
                refreshTokenPromise = authenticate().then((token) => {
                    refreshTokenPromise = null
                    return token
                })
            }
            const token = await refreshTokenPromise
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
            return API(originalRequest)
        }
        return Promise.reject(error)
    }
)

export default API;