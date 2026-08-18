import { useState } from 'react';
import { FaGithub, FaInstagram } from 'react-icons/fa';
import './Footer.css';

const GITHUB_LINKS = [
  {
    label: 'SGCC Organization',
    href: 'https://github.com/official-sgcc',
  },
  {
    label: 'SGCC Account',
    href: 'https://github.com/Sogang-Computer-Club',
  },
  {
    label: '2021-2022',
    href: 'https://github.com/SGCC-homepage',
  },
];

function Footer() {
  const [isGithubMenuOpen, setIsGithubMenuOpen] = useState(false);

  const handleGithubBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsGithubMenuOpen(false);
    }
  };

  return (
    <footer>
      <div className="FooterContainer">
        <div
          className={`footer-github ${isGithubMenuOpen ? 'is-click-open' : ''}`}
          onBlur={handleGithubBlur}
        >
          <button
            className="footer-github-trigger"
            type="button"
            aria-haspopup="menu"
            aria-expanded={isGithubMenuOpen}
            onClick={() => setIsGithubMenuOpen((isOpen) => !isOpen)}
          >
            <FaGithub className="btn" aria-hidden="true" />
            GitHub
          </button>

          <div className="footer-github-dropdown">
            {GITHUB_LINKS.map((link) => (
              <a
                className="footer-github-dropdown__item"
                href={link.href}
                target="_blank"
                rel="noreferrer"
                key={link.href}
                onClick={() => setIsGithubMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <a href="https://www.instagram.com/sgcc_sogang/" target="_blank" rel="noreferrer">
          <FaInstagram className="btn" aria-hidden="true" />
          Instagram
        </a>
      </div>
    </footer>
  );
}

export default Footer;
