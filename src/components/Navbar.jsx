import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Efecto para el fondo del header al hacer scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <button 
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menú"
          style={{position: 'relative', zIndex: 1200}}
        >
          <span></span><span></span><span></span>
        </button>

        <a href="#hero" className="header-logo"><span>STAR'S</span></a>

        <nav className="nav-links">
          <a href="#hero">Menú</a>
          <a href="#catalogo">Catálogo</a>
          <a href="#nosotros">Sobre Nosotros</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <div className="header-actions">
          <button className="btn-cart" onClick={() => setIsCartOpen(true)} aria-label="Abrir carrito">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span className={`cart-count ${cartCount > 0 ? 'show' : ''}`}>{cartCount}</span>
          </button>
        </div>
      </header>

        {/* Menú Móvil */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button 
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <a href="#hero" onClick={() => setMobileMenuOpen(false)}>Menú</a>
        <a href="#catalogo" onClick={() => setMobileMenuOpen(false)}>Catálogo</a>
        <a href="#nosotros" onClick={() => setMobileMenuOpen(false)}>Sobre Nosotros</a>
        <a href="#contacto" onClick={() => setMobileMenuOpen(false)}>Contacto</a>
      </div>
    </>
  );
}