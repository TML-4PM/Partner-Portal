import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests must complete below 500ms
    'errors': ['rate<0.1'],             // Error rate must be less than 10%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api';
const TEST_PARTNER_ID = 'test-partner';

export default function() {
  // Test analytics events ingestion
  const analyticsPayload = {
    partnerId: TEST_PARTNER_ID,
    eventType: 'VIEW',
    timestamp: new Date().toISOString(),
    metadata: {
      page: '/home',
      duration: Math.floor(Math.random() * 300)
    }
  };

  let responses = http.batch([
    // Test analytics endpoint
    ['POST', `${BASE_URL}/analytics/events`, JSON.stringify(analyticsPayload), {
      headers: { 'Content-Type': 'application/json' },
    }],
    
    // Test insights retrieval
    ['GET', `${BASE_URL}/insights/${TEST_PARTNER_ID}`],
    
    // Test file listing
    ['GET', `${BASE_URL}/files/${TEST_PARTNER_ID}`],
  ]);

  // Check responses
  responses.forEach((response) => {
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    if (!success) {
      errorRate.add(1);
    }
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ' }),
  };
}