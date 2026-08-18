import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import api from '../../backend/axios.js';
import './LoginModal.css';
import logoImg from  '../../assets/sgccCharacter1.png';
import { FiUser, FiLock } from 'react-icons/fi';

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

function getLoginErrorMessage(error) {
  const status = error.response?.status;

  if (status === 404) {
    return '아이디를 찾지 못했습니다.';
  }

  if (status === 401) {
    return '아이디 또는 비밀번호가 틀립니다.';
  }

  return '로그인 중 오류가 발생했습니다.';
}

export function LoginForm({ onClose, onSuccess, showCloseButton = false }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMfaChallengeNow, setIsMfaChallengeNow] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [isMfaSubmitting, setIsMfaSubmitting] = useState(false);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/login', {
        username,
        password,
      });

      const mfa_required = response.data?.mfa_required;
      if (mfa_required) {
        const mfa_token = response.data?.mfa_token;
        if (mfa_token == null) {
          setErrorMessage('인증 정보에 문제가 발생했습니다.');
          setIsSubmitting(false);
          return;
        }
        setIsMfaChallengeNow({username, mfa_token});
        setIsSubmitting(false);
        return;
      }

      const token = response.data?.token;
      completeLogin(token);
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleMfaChallenge = async (event) => {
    event.preventDefault();
    setIsMfaSubmitting(true);
    try {
      const response = await api.post('/login/2fa', {
        mfa_token: isMfaChallengeNow.mfa_token,
        code: mfaCode,
      });
      const token = response.data?.token;
      completeLogin(token);
      setIsMfaChallengeNow(null);
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsMfaSubmitting(false);
    }
  }

  const completeLogin = (token) => {
    if (!token) {
      setErrorMessage('로그인 응답에 토큰이 없습니다.');
      return;
    }
  
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USERNAME_KEY, username);
    onSuccess?.({ username, token });
  };

  return (
    <>
      {showCloseButton && (
        <button className="close-btn" onClick={onClose} type="button">X</button>
      )}
      <div className='login-header-content'> 
        <img src={logoImg} alt="SGCC 로고" className="login-header-logo" />
        <div className='login-header-title'> 
          <h2>SGCC Wiki</h2>
          <h1>로그인하여 위키에 참여하세요 !</h1>
        </div>
      </div>
      <form onSubmit={handleLoginSubmit}>
    
        <div className='input-with-icon'> 
          <FiUser className="input-icon" />
          <input
            type="text"
            placeholder=" 학번 또는 아이디"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>
        <div className='input-with-icon'>
          <FiLock className="input-icon" />
          <input
            type="password"
            placeholder=" 비밀번호 입력"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button className="login-submit-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : 'LOGIN'}
        </button>
        <Link className="signup-link-btn" to="/signup" onClick={onClose}>
          회원가입
        </Link>
      </form>
      {isMfaChallengeNow && <form onSubmit={handleMfaChallenge}>
        <div className='input-6code'>
          
        </div>
        <input
          className="two-factor__code-input"
          id="two-factor-enable-code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength="6"
          placeholder="000000"
          value={mfaCode}
          onChange={(event) => setMfaCode(event.target.value)}
          disabled={isSubmitting}
          required
        />
        <button className='login-submit-btn' type='submit' disabled={isMfaSubmitting}>
          {isMfaSubmitting ? '인증 중...' : '인증'}
        </button>
        </form>}
    </>
  );
}

function LoginModal({ onClose, onSuccess }) {
  const handleSuccess = (loginData) => {
    onSuccess?.(loginData);
    onClose();
  };

  return createPortal(
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(event) => event.stopPropagation()}>
        <LoginForm
          onClose={onClose}
          onSuccess={handleSuccess}
          showCloseButton
        />
      </div>
    </div>,
    document.body
  );
}

export default LoginModal;
