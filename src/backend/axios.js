import axios from 'axios';
//import { Cookies } from 'react-cookie';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_SERVER_URL ||
    'http://localhost:8000';

const TOKEN_KEY = 'token';
const HEALTH_CHECKED_KEY = 'health_checked_at';

//const cookies = new Cookies();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem(TOKEN_KEY);

        if (token) {
            config.headers.auth = token;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 전역 API 응답 에러 처리
//
// 서버 연결 자체가 실패하거나
// 백엔드에서 503(Service Unavailable)을 반환하면
// 현재 세션의 헬스체크 기록을 무효화한다.
//
// 이후 새로고침하거나 다시 앱에 진입하면
// App.jsx에서 서버 상태를 다시 확인한다.
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Connection refused, 서버 다운, 네트워크 오류 등
        // HTTP 응답 자체가 없는 경우
        const isConnectionError = !error.response;

        // 백엔드가 서비스 불가 상태를 반환한 경우
        const isServiceUnavailable = error.response?.status === 503;

        if (isConnectionError || isServiceUnavailable) {
            sessionStorage.removeItem(HEALTH_CHECKED_KEY);
        }

        return Promise.reject(error);
    }
);

export default api;