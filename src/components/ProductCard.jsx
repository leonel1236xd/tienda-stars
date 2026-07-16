import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  // 1. Filtrar SOLO las variantes que tengan stock disponible (> 0)
  const availableVariants = product.variantes?.filter(v => Number(v.stock_global) > 0) || [];

  // 2. Extraer colores únicos que SÍ tienen stock
  const colors = Array.from(new Set(availableVariants.map(v => v.color))).map(colorName => {
    const variant = availableVariants.find(v => v.color === colorName);
    return { name: colorName, hex: variant?.color_hex || '#000000' };
  });

  // Estados
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [buttonState, setButtonStatus] = useState('idle');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 3. Tallas disponibles SOLO para el color seleccionado actualmente
const availableSizes = availableVariants
    .filter(v => String(v.color || '').trim() === String(selectedColor || '').trim())
    .map(v => v.talla);

  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    }
  }, [selectedColor, availableSizes, selectedSize]);

  const currentVariant = availableVariants.find(v => 
    String(v.color || '').trim() === String(selectedColor || '').trim() && 
    String(v.talla || '').trim() === String(selectedSize || '').trim()
  );
  const maxStock = currentVariant ? (Number(currentVariant.stock_global) || 0) : 0;

  const handleAdd = () => {
    if (!selectedColor || !selectedSize) return;
    
    const wasAdded = addToCart(product, qty, selectedColor, selectedSize);

    if (wasAdded) {
      setButtonStatus('success');
      setQty(1);
      setTimeout(() => setButtonStatus('idle'), 1500);
    } else {
      setButtonStatus('error');
      setTimeout(() => setButtonStatus('idle'), 2000);
    }
  };

  // Funciones del carrusel
  const nextImage = (e) => {
    e.preventDefault();
    if (product.imagenes?.length > 1) {
      setCurrentImageIndex(prev => prev === product.imagenes.length - 1 ? 0 : prev + 1);
    }
  };

  const prevImage = (e) => {
    e.preventDefault();
    if (product.imagenes?.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? product.imagenes.length - 1 : prev - 1);
    }
  };

  return (
    <article className="product-card reveal visible">
      
      {/* ─── CONTENEDOR DEL CARRUSEL (Calcado de tu HTML original) ─── */}
      <div className="carousel">
        
        {/* Badges de Estado (Novedad / Promoción conectados a la BD) */}
        <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 5, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {product.is_promo && (
            <div style={{ background: '#EF4444', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)', textAlign: 'center', whiteSpace: 'nowrap' }}>
              PROMO
            </div>
          )}
          {product.is_novelty && (
            <div style={{ background: '#10B981', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)', textAlign: 'center', whiteSpace: 'nowrap' }}>
              NUEVO
            </div>
          )}
        </div>

        {/* Pista de imágenes animada por React */}
        <div 
          className="carousel-track" 
          style={{ 
            transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
            transform: `translateX(-${currentImageIndex * 100}%)`,
            overflowX: 'visible' /* Permite que React maneje el deslizamiento */
          }}
        >
          {product.imagenes && product.imagenes.length > 0 ? (
            product.imagenes.map((imgUrl, index) => (
              <div className="carousel-slide" key={index}>
                <img src={imgUrl} alt={`${product.nombre} - vista ${index + 1}`} loading="lazy" />
              </div>
            ))
          ) : (
            <div className="carousel-slide">
              <img src="https://via.placeholder.com/400x500?text=Sin+Imagen" alt="Sin imagen" loading="lazy" />
            </div>
          )}
        </div>

        {/* Controles del Carrusel (Solo si hay > 1 imagen) */}
        {product.imagenes && product.imagenes.length > 1 && (
          <>
            <div className="carousel-dots">
              {product.imagenes.map((_, index) => (
                <button 
                  key={index} 
                  type="button"
                  className={`carousel-dot ${currentImageIndex === index ? 'active' : ''}`} 
                  onClick={(e) => { e.preventDefault(); setCurrentImageIndex(index); }}
                  aria-label={`Imagen ${index + 1}`}
                ></button>
              ))}
            </div>
            
            <button type="button" className="carousel-arrow prev" aria-label="Anterior" onClick={prevImage}>
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button type="button" className="carousel-arrow next" aria-label="Siguiente" onClick={nextImage}>
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>
            </button>
          </>
        )}

        {/* PRECIO (Recuperado y renderizado por tu clase original) */}
        <div className="price-badge">
          Bs {Number(product.precio).toLocaleString('es-BO')}
        </div>
      </div>
      
      {/* ─── CUERPO DE LA TARJETA ─── */}
      <div className="card-body">
        <h3>{product.nombre}</h3>
        <p className="model-desc">{product.descripcion}</p>
        
        {colors.length > 0 && (
          <>
            <span className="selector-label">Color</span>
            <div className="color-selector">
              {colors.map(c => (
                <button 
                  key={c.name}
                  type="button"
                  className={`color-swatch ${selectedColor === c.name ? 'selected' : ''}`}
                  style={{ background: c.hex }}
                  onClick={() => { setSelectedColor(c.name); setQty(1); }}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
            </div>
          </>
        )}
        
        {availableSizes.length > 0 && (
          <>
            <span className="selector-label">Talla</span>
            <div className="size-selector">
              {availableSizes.map(s => (
                <button 
                  key={s}
                  type="button"
                  className={`size-btn ${selectedSize === s ? 'selected' : ''}`}
                  onClick={() => { setSelectedSize(s); setQty(1); }}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
        
        <div className="qty-row">
          <span className="selector-label" style={{ marginBottom: 0 }}>Cantidad</span>
          <div className="qty-control">
            <button type="button" className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
            <span className="qty-val">{qty}</span>
            <button type="button" className="qty-btn" onClick={() => setQty(Math.min(maxStock, qty + 1))}>+</button>
          </div>
        </div>
        
        <button 
          type="button"
          className={`btn-add-cart ${buttonState === 'success' ? 'added' : ''}`} 
          style={buttonState === 'error' ? { background: '#EF4444', boxShadow: 'none' } : {}}
          onClick={handleAdd}
        >
          {buttonState === 'success' ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ¡Añadido!
            </>
          ) : buttonState === 'error' ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              ¡Stock Máximo!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Añadir al Carrito
            </>
          )}
        </button>
      </div>
    </article>
  );
}