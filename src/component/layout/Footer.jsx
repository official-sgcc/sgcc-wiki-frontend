import './Footer.css'
import githubLogo from '../../assets/github.svg'
import instaLogo from '../../assets/insta.png'
import { FaGithub } from 'react-icons/fa';
import { FaInstagram } from 'react-icons/fa';

function Footer() {

  return (
    <footer>
        <div className="FooterContainer">
            <a href="https://github.com/Sogang-Computer-Club" target="_blank">
              <FaGithub className='btn'/>GitHub
            </a>
            <a href="https://www.instagram.com/sgcc_sogang/" target="_blank">
              <FaInstagram className='btn'/>Instagram
            </a>
        </div>
    </footer>
  )
}
export default Footer