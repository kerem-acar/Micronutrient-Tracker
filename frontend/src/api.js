import axios from 'axios';

const api = axios.create({
    baseURL: "https://api.tracknutrients.app",
    withCredentials: true
})

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response ? error.response.status : null;
        const detail = error.response ? error.response.data?.detail : null;

        if ((status === 401 || status === 403) && detail === "Access token expired. Please refresh or login." && !originalRequest._retry){
            originalRequest._retry = true;    
            
            if (isRefreshing) {
                return new Promise(function(resolve, reject){
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err)
                });
            }

            isRefreshing = true;
            try {
                const refreshReponse = await api.post('/refresh_token');

                if (refreshReponse.status === 200) {
                    isRefreshing = false;
                    processQueue(null);
                    return api(originalRequest)
                } else {
                    throw new Error("Refresh token response was not 200")
                }
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;