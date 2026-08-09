import React from 'react';
import { footerData } from '../../data/data.js';
import { FaInstagram, FaFacebook, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import { MdOutlineEmail } from 'react-icons/md';
import styles from './Footer.module.css';

export function Footer() {
  const iconMap = {
    WhatsApp: <FaWhatsapp size={18} />,
    Mail: <MdOutlineEmail size={18} />,
    Instagram: <FaInstagram size={18} />,
    Facebook: <FaFacebook size={18} />,
    YouTube: <FaYoutube size={18} />,
  };

  return (
    <footer className={styles.footer} aria-label="Landing Page Footer">
      <div className={`${styles.container} container`}>
        
        {/* Top Row: Brand & Socials */}
        <div className={styles.topRow}>
          <div className={styles.brandBlock}>
            <img
              src="https://i.ibb.co/k6qGF2t6/IMG-2488-JPG.jpg"
              alt="AskAkashSharma"
              className={styles.footerLogo}
            />
            <p className={styles.tagline}>{footerData.tagline}</p>
          </div>

          <div className={styles.socials} aria-label="Mentor social media links">
            {footerData.social.map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className={styles.socialLink}
                aria-label={`Visit Akash Sharma on ${item.label}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {iconMap[item.label]}
              </a>
            ))}
          </div>
        </div>

        {/* Middle Row: Navigation Links */}
        <div className={styles.middleRow}>
          <nav className={styles.navBlock} aria-label="Footer Nav Links">
            <ul className={styles.linksList}>
              {footerData.links.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className={styles.navLink}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom Row: Risk Disclaimer & Copyright */}
        <div className={styles.bottomRow}>
          <div className={styles.disclaimerBlock}>
            <p className={styles.disclaimerText}>{footerData.disclaimer}</p>
          </div>
          <div className={styles.copyrightBlock}>
            <p className={styles.copyrightText}>{footerData.copyright}</p>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default React.memo(Footer);
