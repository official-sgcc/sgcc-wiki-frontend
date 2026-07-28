import './Header.css'
import { useEffect, useState } from 'react'
import SearchModal from '../../SearchMordal';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginModal from '../account/LoginModal';
import WelcomeHeaderButton from '../page/welcome/WelcomeHeaderButton';
import { isWelcomePeriod } from '../page/welcome/WelcomeTimeSet';
import { FiUser, FiLock, FiSearch } from 'react-icons/fi';

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

function Header() {
  const [isSrchOpen, setIsSrchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
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
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USERNAME_KEY);
    setCurrentUsername('');
    setToken('');
    navigate('/');
  };

  const location = useLocation();

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시글', path: '/wiki/abc' },
];

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
      <nav className="header-nav">
        {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`header-nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          {item.label}
        </Link>
        ))}
      </nav>
      <div className='header-rightside'>
        { showWelcomeButton && <WelcomeHeaderButton /> }
        <button className='srchbtn' onClick={()=>{setIsSrchOpen(true);}} >
          <FiSearch />
        </button>
        <div className="loginbtn">
          {isLoggedIn ? (
            <>
              <Link className="footer-item-login" to="/mypage">
                {currentUsername || 'My Page'}
              </Link>
              <p className="footer-item-login" onClick={handleLogout}>
                Logout
              </p>
            </>
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
