import './Header.css'
import { useEffect, useState } from 'react'
import SearchModal from '../../SearchMordal';
import { Link } from 'react-router-dom';
import LoginModal from '../account/LoginModal';

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

function Header() {
  const [isSrchOpen, setIsSrchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(() => sessionStorage.getItem(USERNAME_KEY) || '');
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const isLoggedIn = Boolean(token);

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
        <button className='srchbtn' onClick={()=>{setIsSrchOpen(true);}} />
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
