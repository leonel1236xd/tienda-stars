import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';

export default function CheckoutModal({ storeInfo }) {
  const { cart, cartTotal, isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCart();
  
  // Por defecto empezamos con Cochabamba seleccionado, la cuna de STAR'S
  const [formData, setFormData] = useState({ nombre: '', telefono: '', departamento: 'Cochabamba' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleChange = (e) => {
    let { name, value } = e.target;

    // VALIDACIÓN 1: El nombre solo permite letras y espacios
    if (name === 'nombre') {
      value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }
    
    // VALIDACIÓN 2: El teléfono solo permite números y máximo 8 dígitos
    if (name === 'telefono') {
      value = value.replace(/\D/g, ''); // Remueve cualquier letra o símbolo
      if (value.length > 8) value = value.slice(0, 8);
    }

    setFormData({ ...formData, [name]: value });
    setError(null);
  };

  const closeAndReset = () => {
    setIsCheckoutOpen(false);
    setSuccess(false);
    setFormData({ nombre: '', telefono: '', departamento: 'Cochabamba' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validación extra antes de enviar
    if (!formData.nombre.trim()) {
      setError('Por favor, ingresa tu nombre completo.');
      return;
    }
    if (formData.telefono.length !== 8) {
      setError('El número de celular debe tener exactamente 8 dígitos.');
      return;
    }

    try {
      setLoading(true);

      const { data: client, error: clientErr } = await supabase
        .from('clientes')
        .insert([{ 
          nombre: formData.nombre.trim(), 
          telefono: formData.telefono, 
          ciudad: formData.departamento,
          total_gastado: cartTotal
        }])
        .select()
        .single();

      if (clientErr) throw new Error('Error al registrar tus datos de cliente.');

      const { data: pedido, error: pedidoErr } = await supabase
        .from('pedidos')
        .insert([{
          cliente_id: client.id,
          sucursal_id: storeInfo?.id,
          subtotal: cartTotal,
          envio: 0,
          total: cartTotal,
          estado: 'Pendiente'
        }])
        .select()
        .single();

      if (pedidoErr) throw new Error('Error al generar la orden.');

      const itemsToInsert = cart.map(item => ({
        pedido_id: pedido.id,
        producto_id: item.id,
        producto_nombre: item.name,
        imagen_url: item.image,
        color: item.color,
        talla: item.size,
        cantidad: item.qty,
        precio_unitario: item.price,
        total: item.price * item.qty
      }));

      const { error: itemsErr } = await supabase.from('pedido_items').insert(itemsToInsert);
      if (itemsErr) throw new Error('Error al procesar los productos.');

      const E = {
        star: '\u{2605}',      // ★
        line: '\u{2501}'.repeat(17), // ━━━...
        bullet: '\u{25AA}',    // ▪
        dot: '\u{2022}',       // •
        check: '\u{2713}',     // ✓
        arrow: '\u{27A4}'      // ➤
      };

      const lines = cart.map((i, idx) =>
        `${idx + 1}. *${i.name}*\n   ${E.dot} Color: ${i.color}   ${E.bullet} Talla: ${i.size}\n   ${E.dot} Cant: ${i.qty}   ${E.bullet} Bs ${(i.price * i.qty).toLocaleString('es-BO')}`
      ).join('\n\n');

      const waMsg = `${E.star} *NUEVO PEDIDO - STAR'S* ${E.star}
${E.line}
*DATOS DEL CLIENTE*
Nombre: ${formData.nombre.trim()}
Celular: ${formData.telefono}
Depto: ${formData.departamento}

${E.line}
*PRENDAS*
${lines}

${E.line}
${E.check} *TOTAL: Bs ${cartTotal.toLocaleString('es-BO')}*
${E.line}

Pedido generado desde el catálogo web.
Quedo atento para coordinar el envío ${E.arrow}`;
      
      const whatsappNumber = storeInfo?.whatsapp || '59172261616';
      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

      setSuccess(true);
      clearCart();
      
      // Aumentamos el tiempo a 3.5s para que disfruten la animación y lean las instrucciones
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setSuccess(false);
        setFormData({ nombre: '', telefono: '', departamento: 'Cochabamba' });
        window.open(waUrl, '_blank');
      }, 3500); 

    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocurrió un error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-overlay open" onClick={(e) => e.target.className.includes('checkout-overlay') && closeAndReset()}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>
        <button className="checkout-close" onClick={closeAndReset} aria-label="Cerrar">
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        
        {success ? (
          /* PANTALLA DE ÉXITO RESUMIDA Y DIRECTA */
          <div className="checkout-success-view">
            <div className="success-animation">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h3 style={{ color: '#22c55e', marginBottom: '10px', fontSize: '1.6rem' }}>
              ¡Pedido Registrado!
            </h3>
            <p style={{ color: 'var(--grey-300)', fontSize: '1rem' }}>
              Abriendo WhatsApp para coordinar tu envío...
            </p>
          </div>
        ) : (

          /* FORMULARIO MEJORADO */
          <>
            <h3>Datos de Envío</h3>
            <p className="checkout-desc">Ingresa tus datos para confirmar el pedido y coordinar por WhatsApp.</p>
            
            {error && <div className="checkout-error show">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="checkout-form-group">
                <label>Nombre Completo</label>
                <input 
                  name="nombre" 
                  value={formData.nombre} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="Ej: Juan Pérez" 
                  autoComplete="name"
                  required 
                  disabled={loading} 
                />
              </div>
              <div className="checkout-form-group">
                <label>Número de Celular (Solo 8 dígitos)</label>
                <input 
                  name="telefono" 
                  type="tel" 
                  value={formData.telefono} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="Ej: 72261616" 
                  autoComplete="tel"
                  required 
                  disabled={loading} 
                />
              </div>
              <div className="checkout-form-group">
                <label>Departamento de Bolivia</label>
                <select 
                  name="departamento" 
                  value={formData.departamento} 
                  onChange={handleChange} 
                  className="form-input"
                  required
                  disabled={loading}
                >
                  <option value="Beni">Beni</option>
                  <option value="Chuquisaca">Chuquisaca</option>
                  <option value="Cochabamba">Cochabamba</option>
                  <option value="La Paz">La Paz</option>
                  <option value="Oruro">Oruro</option>
                  <option value="Pando">Pando</option>
                  <option value="Potosí">Potosí</option>
                  <option value="Santa Cruz">Santa Cruz</option>
                  <option value="Tarija">Tarija</option>
                </select>
              </div>
              
              <button type="submit" className="btn-checkout-confirm" disabled={loading}>
                {loading ? (
                  <div className="checkout-loading show" style={{color:'white'}}><div className="dot-spinner" style={{borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white'}}></div> Procesando...</div>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="white" style={{width:'20px', height:'20px'}}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                    Confirmar y Enviar por WhatsApp
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}