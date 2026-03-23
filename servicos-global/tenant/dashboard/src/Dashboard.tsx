import React, { useEffect, useState } from 'react';
import { KPICard } from './components/KPICard';
import { TabelaGlobal } from '@nucleo/tabela-global';

// Using dummy type to simulate context or global state config
interface DashboardProps {
  tenantId: string;
  productId?: string;
  userId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ tenantId, productId, userId }) => {
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Assuming tenant services are prefixed with /api/tenant/dashboard for the proxy
        const queryParams = new URLSearchParams({ tenant_id: tenantId });
        if (productId) queryParams.append('product_id', productId);
        if (userId) queryParams.append('user_id', userId);

        // Here we hit local logic since this is a decoupled frontend slice
        // If hosted on proxy, it's /api/tenant/dashboard/kpis
        const response = await fetch(`/api/tenant/dashboard/kpis?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch KPIs');
        }
        
        const json = await response.json();
        setKpis(json.data || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tenantId, productId, userId]);

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'var(--danger-color)' }}>
        <h2>Dashboard Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Overview
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Consolidated performance metrics and key indicators.
        </p>
      </header>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {loading ? (
          <>
            <KPICard loading title="" value="" />
            <KPICard loading title="" value="" />
            <KPICard loading title="" value="" />
            <KPICard loading title="" value="" />
          </>
        ) : kpis.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No KPIS available for this context.</p>
        ) : (
          kpis.map((kpi, idx) => (
            <KPICard
              key={idx}
              title={kpi.name}
              value={kpi.value}
              unit={kpi.unit}
            />
          ))
        )}
      </div>

      {/* TabelaGlobal Integration Example for recent snapshots or detailed widget */}
      <section style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Recent Activity Details
        </h2>
        {/* Placeholder table to show integration with @nucleo/tabela-global */}
        <TabelaGlobal
          dados={kpis}
          colunas={[
            { chave: 'name', label: 'Metric Name' },
            { chave: 'value', label: 'Last Value' },
            { chave: 'unit', label: 'Unit' },
            { chave: 'date', label: 'Snapshot Date' },
          ]}
          onVisualizar={(linha) => console.log('Visualizando', linha)}
        />
      </section>
    </div>
  );
};
