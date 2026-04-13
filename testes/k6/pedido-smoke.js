import http from 'k6/http';
import { check, group } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8026';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};

function buildHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': __ENV.INTERNAL_SERVICE_KEY,
    'x-tenant-id': 'tenant_smoke_test',
    'x-user-id': 'smoke_user',
  };
}

export default function () {
  const headers = buildHeaders();

  // 1. Health check
  group('GET /health', function () {
    const res = http.get(`${BASE_URL}/health`, { headers });
    check(res, {
      'health: status is 200': (r) => r.status === 200,
    });
  });

  // 2. Create pedido
  let pedidoId = null;

  group('POST /api/v1/pedidos', function () {
    const payload = JSON.stringify({
      tipo_operacao: 'importacao',
      numero_pedido: 'SMOKE-TEST-001',
      itens: [],
    });

    const res = http.post(`${BASE_URL}/api/v1/pedidos`, payload, { headers });

    check(res, {
      'create pedido: status is 201': (r) => r.status === 201,
      'create pedido: response has id': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body && (body.id || (body.data && body.data.id));
        } catch (_) {
          return false;
        }
      },
    });

    if (res.status === 201) {
      try {
        const body = JSON.parse(res.body);
        pedidoId = body.id || (body.data && body.data.id) || null;
      } catch (_) {
        pedidoId = null;
      }
    }
  });

  // 3. Get pedido by id
  if (pedidoId !== null) {
    group(`GET /api/v1/pedidos/:id`, function () {
      const res = http.get(`${BASE_URL}/api/v1/pedidos/${pedidoId}`, { headers });
      check(res, {
        'get pedido: status is 200': (r) => r.status === 200,
      });
    });

    // 4. Delete pedido
    group(`DELETE /api/v1/pedidos/:id`, function () {
      const res = http.del(`${BASE_URL}/api/v1/pedidos/${pedidoId}`, null, { headers });
      check(res, {
        'delete pedido: status is 204': (r) => r.status === 204,
      });
    });
  }
}

export function teardown(data) {
  console.log('Smoke test complete. Summary data:', JSON.stringify(data));
}
