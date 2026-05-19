import { useState } from 'react';
import api from '../../backend/axios.js';
import './LoginModal.css';

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

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/login', {
        username,
        password,
      });
      const token = response.data?.token;

      if (!token) {
        setErrorMessage('로그인 응답에 토큰이 없습니다.');
        return;
      }

      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USERNAME_KEY, username);
      onSuccess?.({ username, token });
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showCloseButton && (
        <button className="close-btn" onClick={onClose} type="button">X</button>
      )}
      <h2>LOGIN</h2>
      <form onSubmit={handleLoginSubmit}>
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button className="login-submit-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : 'LOGIN'}
        </button>
      </form>
    </>
  );
}

function LoginModal({ onClose, onSuccess }) {
  const handleSuccess = (loginData) => {
    onSuccess?.(loginData);
    onClose();
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(event) => event.stopPropagation()}>
        <LoginForm
          onClose={onClose}
          onSuccess={handleSuccess}
          showCloseButton
        />
      </div>
    </div>
  );
}

export default LoginModal;
