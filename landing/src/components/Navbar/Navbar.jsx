import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navData } from '../../data/data.js';
import styles from './Navbar.module.css';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleNav = (e, href) => {
    e.preventDefault();
    if (href === '/' || href === '#hero') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (href.startsWith('/') && !href.includes('#')) {
      navigate(href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (href.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const id = href.replace('/#', '');
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        {/* Logo */}
        <a 
          href="/" 
          className={styles.logoLink} 
          aria-label="AskAkashSharma Home"
          onClick={(e) => handleNav(e, '/')}
        >
          <img
            src="https://res.cloudinary.com/tmgtqqqg/image/upload/v1785589653/IMG_2488.JPG_qgh8kt.jpg"
            alt="AskAkashSharma"
            className={styles.logo}
          />
        </a>

        {/* Desktop links */}
        <ul className={styles.links}>
          {navData.links.map((link) => (
            <li key={link.label}>
              <a 
                href={link.href} 
                className={`${styles.link} ${link.label === '1to1' ? styles.highlightLink : ''}`}
                onClick={(e) => handleNav(e, link.href)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <a 
          href="/#pricing" 
          className={styles.ctaBtn}
          onClick={(e) => handleNav(e, '/#pricing')}
        >
          {navData.cta}
        </a>

        {/* Hamburger — mobile only */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </button>
      </nav>

      {/* Mobile Dropdown Overlay */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <ul className={styles.mobileLinks}>
          {navData.links.map((link, i) => (
            <li
              key={link.label}
              className={styles.mobileLinkItem}
              style={{ '--i': i }}
            >
              <a 
                href={link.href}
                className={`${styles.mobileLink} ${link.label === '1to1' ? styles.mobileLinkHighlight : ''}`}
                onClick={(e) => handleNav(e, link.href)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        
        <a 
          href="/#pricing"
          className={styles.mobileCta}
          onClick={(e) => handleNav(e, '/#pricing')}
        >
          {navData.cta}
        </a>
      </div>
    </>
  );
}

export default React.memo(Navbar);
