import './Header.css'
import { useState } from 'react'
import { useEffect } from 'react';
import SearchModal from '../../SearchMordal';
import { Link } from 'react-router-dom';

function Header() {
  const [isSrchOpen, setIsSrchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // 테스트용 임시 아이디/비번
    const mockId = "noeul";
    const mockPw = "1222";

    if (userId === mockId && userPw === mockPw) {
        alert("로그인 성공!");
        closeLoginModal();
    } else {
        setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
    setUserId('');
    setUserPw('');
    setErrorMessage('');
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
    <header>
      <div className="header-logo">
        <Link to={`/`}>SGCC Wiki</Link>
      </div>
      <div className='header-rightside'>
        <button className='srchbtn' onClick={()=>{setIsSrchOpen(true);}} />
        <div className="loginbtn">
          <p 
            className="footer-item-login" 
            onClick={() => {
              setIsLoginOpen(true)
          }}
          >
            Login
          </p>
        </div>
      </div>
      {isSrchOpen && <SearchModal onClose={() => setIsSrchOpen(false)} />}
      {isLoginOpen && (
        <div className="login-modal-overlay" onClick={closeLoginModal}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeLoginModal}>X</button>
            <h2>LOGIN</h2>
            <form onSubmit={handleLoginSubmit}>
              <input 
                type="text" 
                placeholder="아이디" 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)}
                required // 비어있는 상태 방지
              />
              <input 
                type="password" 
                placeholder="비밀번호" 
                value={userPw} 
                onChange={(e) => setUserPw(e.target.value)}
                required // 비어있는 상태 방지
              />
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <button type="submit" className="login-submit-btn">LOGIN</button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
export default Header