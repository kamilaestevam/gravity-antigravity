/**
 * useProductMenu — Hook que monta a seção "Produtos Gravity" do menu lateral.
 */
import { useEffect, useState } from 'react';

// Produtos mockados na Gravity Store (ainda não existem no catálogo real)
const MOCKED_SLUGS = new Map([
    ['smart-read', 'Smart Read'],
    ['bid-frete-internacional', 'BID Frete Internacional'],
    ['bid-cambio', 'BID Câmbio'],
]);

export function useProductMenu() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const companyId = sessionStorage.getItem('gravity_company_id');

                const [catRes, compRes] = await Promise.all([
                    fetch('/api/v1/products').catch(() => null),
                    companyId
                        ? fetch(`/api/v1/companies/${companyId}/products`, {
                            headers: { 'x-tenant-id': sessionStorage.getItem('gravity_tenant_id') ?? '' },
                        }).catch(() => null)
                        : Promise.resolve(null),
                ]);

                if (cancelled) return;

                const catalogProducts = [];
                if (catRes && catRes.ok) {
                    const data = await catRes.json();
                    (data.products ?? []).forEach((p) => {
                        if (p.status === 'Ativo') {
                            catalogProducts.push({ slug: p.slug, name: p.name, status: p.status });
                        }
                    });
                }

                const companyKeys = new Set();
                if (compRes && compRes.ok) {
                    const data = await compRes.json();
                    (data.products ?? []).forEach((p) => {
                        if (p.is_active) companyKeys.add(p.product_key);
                    });
                }

                const items = [];

                for (const cp of catalogProducts) {
                    items.push({
                        slug: cp.slug,
                        name: cp.name,
                        status: companyKeys.has(cp.slug) ? 'active' : 'contract',
                    });
                }

                for (const [slug, name] of MOCKED_SLUGS) {
                    if (!items.some(i => i.slug === slug)) {
                        items.push({ slug, name, status: 'coming_soon' });
                    }
                }

                if (!cancelled) setProducts(items);
            } catch (err) {
                console.error('[useProductMenu] Erro ao carregar produtos:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, []);

    return { products, loading };
}
