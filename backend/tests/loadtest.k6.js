import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20, // počet virtuálních uživatelů
  duration: '1m', // délka testu
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95 % požadavků musí být do 800ms
    http_req_failed: ['rate<0.01'], // méně než 1 % chyb
  },
};

export default function () {
  const res = http.get('http://localhost:3001/api/health/health');
  check(res, {
    'status je 200': (r) => r.status === 200,
  });
  sleep(1);
}
