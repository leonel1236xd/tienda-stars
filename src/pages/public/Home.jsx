import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Catalog from '../../components/Catalog';

export default function Home() {
  const { storeInfo } = useOutletContext();

  const whatsappNumber = storeInfo?.whatsapp || '59172261616';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('¡Hola! Vi su catálogo web y me gustaría recibir más información.')}`;

  // Formateador para mostrar +591 separado del número
  const formatWhatsapp = (num) => {
    if (!num) return '';
    const str = String(num);
    if (str.startsWith('591') && str.length > 3) {
      return `+591 ${str.slice(3)}`;
    }
    return `+${str}`;
  };

  // ANIMACIÓN SCROLL REVEAL
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="hero" id="hero">
        <div className="hero-bg"></div>
        <div className="hero-watermark" aria-hidden="true">STAR'S</div>
        <div className="hero-content">
          <div className="hero-logo">
            <svg viewBox="0 0 480 220" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5BC0EB"/><stop offset="50%" stopColor="#FFFFFF"/><stop offset="100%" stopColor="#5BC0EB"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <line x1="40" y1="60" x2="440" y2="60" stroke="url(#logoGrad)" strokeWidth="1" opacity=".3"/>
              <line x1="40" y1="170" x2="440" y2="170" stroke="url(#logoGrad)" strokeWidth="1" opacity=".3"/>
              <text x="240" y="145" textAnchor="middle" fontFamily="'Anton', sans-serif" fontSize="110" fontWeight="400" fill="url(#logoGrad)" filter="url(#glow)" letterSpacing="18">STAR'S</text>
              <text x="240" y="195" textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize="13" fontWeight="600" fill="#8D949A" letterSpacing="8" style={{ textTransform: 'uppercase' }}>PREMIUM DENIM</text>              <polygon points="240,42 244,50 240,58 236,50" fill="url(#logoGrad)" opacity=".5"/>
            </svg>
          </div>
          <p className="hero-tagline">"Viste con carácter. El estilo y el ajuste perfecto marcan tu camino."</p>
        </div>
        <a href="#catalogo" className="scroll-indicator"><span>Explorar Catálogo</span><div className="chevron"></div></a>
      </section>

      <Catalog />

      <section className="about-section" id="nosotros">
        <h2 className="reveal">Sobre Nosotros</h2>
        <p className="reveal">En <strong>STAR'S</strong> creemos que el denim es más que una prenda: es una declaración de identidad. Cada jean está confeccionado con telas de primera calidad, costuras reforzadas y cortes diseñados para adaptarse al ritmo de la vida urbana moderna.</p>
        <p className="reveal">Nuestro compromiso es ofrecer estilo, durabilidad y confort en cada pieza. Desde tallas estándar hasta tallas especiales, todos merecen vestir con carácter.</p>
      </section>
      
      <section className="contact-section" id="contacto">
        <div className="contact-container reveal">
          
          <div className="contact-info-col">
            <h2>HÁBLANOS DIRECTAMENTE</h2>
            <div className="contact-list">
              
              {storeInfo?.whatsapp && (
                <div className="contact-list-item">
                  <div className="contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div className="contact-item-text">
                    <h5>WhatsApp</h5>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-value">
                      {formatWhatsapp(storeInfo.whatsapp)} {/* Aplicamos el nuevo formato aquí */}
                    </a>
                    <p>Haz tu pedido directamente - Respuesta rápida</p>
                  </div>
                </div>
              )}

              {storeInfo?.instagram && (
                <div className="contact-list-item">
                  <div className="contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </div>
                  <div className="contact-item-text">
                    <h5>Instagram</h5>
                    <a href={storeInfo.instagram_url || '#'} target="_blank" rel="noopener noreferrer" className="contact-value">{storeInfo.instagram}</a>
                    <p>Síguenos para ver novedades</p>
                  </div>
                </div>
              )}

              {storeInfo?.facebook && (
                <div className="contact-list-item">
                  <div className="contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </div>
                  <div className="contact-item-text">
                    <h5>Facebook</h5>
                    <a href={storeInfo.facebook_url || '#'} target="_blank" rel="noopener noreferrer" className="contact-value">{storeInfo.facebook}</a>
                    <p>Página oficial en Facebook</p>
                  </div>
                </div>
              )}

              {storeInfo?.tiktok && (
                <div className="contact-list-item">
                  <div className="contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5.5-1.5M13 8.5a5.5 5.5 0 0 0 5.5 5.5"/></svg>
                  </div>
                  <div className="contact-item-text">
                    <h5>TikTok</h5>
                    <a href={storeInfo.tiktok_url || '#'} target="_blank" rel="noopener noreferrer" className="contact-value">{storeInfo.tiktok}</a>
                    <p>Mira nuestras tendencias de moda</p>
                  </div>
                </div>
              )}

              {storeInfo?.ciudad && (
                <div className="contact-list-item">
                  <div className="contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div className="contact-item-text">
                    <h5>Ubicación</h5>
                    <span className="contact-value">{storeInfo.ciudad}, Bolivia</span>
                    <p>{storeInfo.direccion || 'Entregas y envíos a todo el país'}</p>
                  </div>
                </div>
              )}

              {storeInfo?.horario_atencion && (
                <div className="contact-list-item">
                  <div className="contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                      </svg>
                  </div>
                  <div className="contact-item-text">
                    <h5>Horario de Atención</h5>
                    <span className="contact-value">
                      {storeInfo.horario_atencion.split('|').map((line, idx) => (
                        <span key={idx} style={{ display: 'block' }}>{line.trim()}</span>
                      ))}
                    </span>
                  </div>
                </div>
              )}
              {storeInfo?.envios && (
                <div className="contact-list-item">
                  <div className="contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  </div>
                  <div className="contact-item-text">
                    <h5>Envíos Nacionales</h5>
                    <span className="contact-value">{storeInfo.envios}</span>
                    <p>Coordinamos tu entrega rápida por la agencia de tu preferencia</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="contact-card-col">
            <div className="cta-card">
              <div className="cta-card-bg"></div>
              <div className="cta-cart-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <h3>¿LISTO PARA TU PEDIDO?</h3>
              <p className="cta-desc">Usa el catálogo para armar tu pedido completo, agrega al carrito y envíanoslo por WhatsApp. Te asesoramos al instante.</p>
              
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="cta-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{width:'20px', height:'20px'}}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                CHATEAR POR WHATSAPP
              </a>

              <p className="cta-note">O usa el carrito del catálogo para armar tu pedido completo</p>
              
              {/* SOCIAL ICONS (Restaurados) */}
              <div className="cta-socials">
                <a href={storeInfo?.instagram_url || '#'} target="_blank" rel="noopener noreferrer" className="cta-social-btn" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="cta-social-btn" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </a>
                <a href={storeInfo?.facebook_url || '#'} target="_blank" rel="noopener noreferrer" className="cta-social-btn" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href={storeInfo?.tiktok_url || '#'} target="_blank" rel="noopener noreferrer" className="cta-social-btn" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5.5-1.5M13 8.5a5.5 5.5 0 0 0 5.5 5.5"/></svg>
                </a>
              </div>

            </div>
          </div>

        </div>
      </section>
    </>
  );
}