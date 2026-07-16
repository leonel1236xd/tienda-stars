import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import ProductCard from './ProductCard';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // NUEVO: Estado para guardar categorías dinámicas
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*, categorias(nombre, slug), variantes(*)')
        .eq('genero', 'hombre') // Asegúrate que en Estrella diga 'mujer'
        .eq('estado', 'activo')
        .eq('visible', true);

      if (error) throw error;
      
      const fetchedProducts = data || [];

      // 🚨 AQUÍ ESTÁ EL ORDENAMIENTO CORRECTO 🚨
      // Los productos con is_novelty o is_promo irán arriba
      const sortedProducts = fetchedProducts.sort((a, b) => {
        const priorityA = (a.is_novelty || a.is_promo) ? 1 : 0;
        const priorityB = (b.is_novelty || b.is_promo) ? 1 : 0;
        return priorityB - priorityA; 
      });

      setProducts(sortedProducts);

      // Lógica de categorías (tu código existente)
      const availableCategories = [];
      const catSlugs = new Set();
      sortedProducts.forEach(prod => {
        const totalStock = prod.variantes?.reduce((sum, v) => sum + v.stock_global, 0) || 0;
        if (totalStock > 0 && prod.categorias && !catSlugs.has(prod.categorias.slug)) {
          availableCategories.push(prod.categorias);
          catSlugs.add(prod.categorias.slug);
        }
      });
      setCategories(availableCategories);
      
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const subscription = supabase
      .channel('variantes-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'variantes' }, fetchProducts)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  // ANIMACIONES DE LAS TARJETAS AL HACER SCROLL
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [products, activeFilter]); // Se vuelve a ejecutar si cambian los productos o el filtro

  const filteredProducts = products.filter((product) => {
    const totalStock = product.variantes?.reduce((sum, v) => sum + v.stock_global, 0) || 0;
    if (totalStock <= 0) return false;

    if (activeFilter === 'all') return true;
    return product.categorias?.slug === activeFilter;
  });

  return (
    <section className="catalog" id="catalogo">
      <div className="section-header reveal">
        <h2>Catálogo</h2>
        <p>Explora nuestros modelos exclusivos con corte impecable y telas de calidad premium.</p>
      </div>

      {/* RENDERIZADO DINÁMICO DE CATEGORÍAS */}
      <div className="filter-tabs reveal">
        <button 
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} 
          onClick={() => setActiveFilter('all')}
        >
          Todos
        </button>
        {/* Generamos los botones solos basados en la base de datos */}
        {categories.map(cat => (
          <button 
            key={cat.slug} 
            className={`filter-tab ${activeFilter === cat.slug ? 'active' : ''}`} 
            onClick={() => setActiveFilter(cat.slug)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      <div className="product-grid" id="product-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-card reveal"></div>)
        ) : filteredProducts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#8D949A' }} className="reveal">
            No hay productos disponibles por el momento.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="reveal">
              <ProductCard product={product} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}