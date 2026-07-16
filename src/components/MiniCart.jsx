import { useCart } from '../context/CartContext';

export default function MiniCart() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, updateCartItem, cartTotal, setIsCheckoutOpen } = useCart();

  if (isCartOpen) document.body.style.overflow = 'hidden';
  else document.body.style.overflow = '';

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>

      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Tu Pedido</h2>
          <button className="btn-close-cart" onClick={() => setIsCartOpen(false)} aria-label="Cerrar carrito">
            <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2" fill="none">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map((item, index) => {
// LÓGICA DE VARIANTES Y LÍMITES (Blindada contra nulos y stock cero)
const variantes = item.variantes || [];

// 1. Colores únicos
const uniqueColors = [...new Set(variantes.map(v => String(v.color || '').trim()))];
if (uniqueColors.length === 0) uniqueColors.push(String(item.color || '').trim());

// 2. Tallas disponibles (AQUÍ INTEGRAMOS TU LÓGICA DE STOCK > 0)
const availableSizes = [...new Set(variantes
  .filter(v => Number(v.stock_global) > 0 && String(v.color || '').trim() === String(item.color || '').trim())
  .map(v => String(v.talla || '').trim())
)];
if (availableSizes.length === 0) availableSizes.push(String(item.size || '').trim());

// 3. Stock máximo exacto
const currentVariant = variantes.find(v => 
  String(v.color || '').trim() === String(item.color || '').trim() && 
  String(v.talla || '').trim() === String(item.size || '').trim()
);
const maxStock = currentVariant ? (Number(currentVariant.stock_global) || 0) : 0;

              return (
                <div key={`${item.id}-${index}-${item.color}-${item.size}`} className="cart-item">
                  <div className="cart-item-img">
                    {item.image ? <img src={item.image} alt={item.name} /> : <div style={{background:'#1C2541', height:'100%'}}></div>}
                  </div>
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    
                    {/* NUEVOS COMBOBOXES DE EDICIÓN RÁPIDA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '.7rem', color: 'var(--grey-300)' }}>Color:</span>
                        <select 
                          className="cart-item-select" 
                          value={item.color}
                          onChange={(e) => {
                            const newColor = e.target.value;
                            const sizesForNewColor = variantes
                              .filter(v => Number(v.stock_global) > 0 && String(v.color || '').trim() === newColor)
                              .map(v => String(v.talla || '').trim());
                            let newSize = item.size;
                            // Auto-seleccionar talla si la actual no existe en el nuevo color
                            if (!sizesForNewColor.includes(item.size) && sizesForNewColor.length > 0) newSize = sizesForNewColor[0];
                            updateCartItem(index, { color: newColor, size: newSize });
                          }}
                        >
                          {uniqueColors.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '.7rem', color: 'var(--grey-300)' }}>Talla:</span>
                        <select 
                          className="cart-item-select" 
                          value={item.size}
                          onChange={(e) => updateCartItem(index, { size: e.target.value })}
                        >
                          {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    {/* BOTONES DE CANTIDAD (Con bloqueo de stock) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <span style={{ fontSize: '.7rem', color: 'var(--grey-300)' }}>Cant:</span>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', background: 'rgba(255,255,255,0.03)' }}>
                        <button onClick={() => updateQuantity(index, -1, maxStock)} style={{ width: '24px', cursor: 'pointer', border: 'none', background: 'none', color: 'inherit' }}>-</button>
                        <span style={{ fontSize: '.75rem', fontWeight: '700', padding: '0 6px', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                        <button 
                          onClick={() => updateQuantity(index, 1, maxStock)} 
                          disabled={item.qty >= maxStock}
                          style={{ width: '24px', cursor: item.qty >= maxStock ? 'not-allowed' : 'pointer', border: 'none', background: 'none', color: item.qty >= maxStock ? 'var(--grey-400)' : 'inherit' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="cart-item-price" style={{ marginTop: '4px', display: 'inline-block' }}>
                      Bs {(item.price * item.qty).toLocaleString('es-BO')}
                    </span>
                  </div>
                  <button className="btn-remove-item" onClick={() => removeFromCart(index)} aria-label="Eliminar">
                    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <strong>Bs {cartTotal.toLocaleString('es-BO')}</strong>
            </div>
            <button 
              className="btn-checkout-wa" 
              onClick={() => {
                setIsCartOpen(false);
                setTimeout(() => setIsCheckoutOpen(true), 300);
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style={{width:'22px', height:'22px'}}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              Confirmar Pedido por WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  );
}