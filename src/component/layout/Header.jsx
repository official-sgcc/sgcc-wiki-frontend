import './Header.css'
import { useEffect, useState } from 'react'
import SearchModal from '../../SearchMordal';
import { Link, useNavigate } from 'react-router-dom';
import LoginModal from '../account/LoginModal';
import WelcomeHeaderButton from '../page/welcome/WelcomeHeaderButton';
import { isWelcomePeriod } from '../page/welcome/WelcomeTimeSet';
import { FiUser, FiSearch, FiChevronDown } from 'react-icons/fi';

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

function Header() {
  const [isSrchOpen, setIsSrchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(() => sessionStorage.getItem(USERNAME_KEY) || '');
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const isLoggedIn = Boolean(token);
  const navigate = useNavigate();
  const showWelcomeButton = isWelcomePeriod(); // 신입 부원 모집 버튼 보이기 bool

  const closeLoginModal = () => {
    setIsLoginOpen(false);
  };

  const handleLoginSuccess = ({ username, token }) => {
    setCurrentUsername(username);
    setToken(token);
    window.dispatchEvent(new Event('auth-state-change'));
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USERNAME_KEY);
    setCurrentUsername('');
    setToken('');
    window.dispatchEvent(new Event('auth-state-change'));
    navigate('/');
  };

  useEffect(() => {
      // 스크롤 막기
      if(isLoginOpen||isSrchOpen){
        document.body.style.overflow = "hidden";
      }else{
        document.body.style.overflow = "auto";
      }

      // 모달 닫히면 복구
      return () => {
      document.body.style.overflow = "auto";
      };
  }, [isLoginOpen,isSrchOpen]);

  return (
    <header className='main-header'>
      <div className="header-logo">
        <Link to={`/`}>SGCC Wiki</Link>
      </div>
      <div className='header-rightside'>
        { showWelcomeButton && <WelcomeHeaderButton /> }
        <button className='srchbtn' onClick={()=>{setIsSrchOpen(true);}} >
          <FiSearch />
        </button>
        <div className="loginbtn">
          {isLoggedIn ? (
            <div className="user-menu">
              <button
                type="button"
                className="footer-item-login user-menu-trigger"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsUserMenuOpen((open) => !open)}
              >
                <FiUser className="input-icon" aria-hidden="true" />
                <span className="user-menu-label">{currentUsername || '사용자'}</span>
                <FiChevronDown className="user-menu-chevron" aria-hidden="true" />
              </button>

              {isUserMenuOpen && (
                <div className="user-menu-dropdown" role="menu">
                  <Link
                    to="/mypage"
                    role="menuitem"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    role="menuitem"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p 
              className="footer-item-login" 
              onClick={() => {
                setIsLoginOpen(true)
            }}
            >
              <FiUser className="input-icon" />
              Login
            </p>
          )}
        </div>
      </div>
      {isSrchOpen && <SearchModal onClose={() => setIsSrchOpen(false)} />}
      {isLoginOpen && (
        <LoginModal onClose={closeLoginModal} onSuccess={handleLoginSuccess} />
      )}
    </header>
  )
}
export default Header
