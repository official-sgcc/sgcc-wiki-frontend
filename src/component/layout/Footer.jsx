import './Footer.css'
import githubLogo from '../../assets/github.svg'
import instaLogo from '../../assets/insta.png'

function Footer() {

  return (
    <footer>
        <div className="FooterContainer">
            <a href="https://github.com/Sogang-Computer-Club" target="_blank"><img className="logo" src={githubLogo} alt="GitHub" />SGCC 공식 GitHub</a>
            <a href="https://www.instagram.com/sgcc_sogang/" target="_blank"><img className="logo" src={instaLogo} alt="Insta" />SGCC 공식 인스타</a>
        </div>
    </footer>
  )
}
export default Footer