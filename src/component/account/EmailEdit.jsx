import { useEffect, useState } from 'react';
import api from '../../backend/axios.js';
import './EmailEdit.css';

function getEmailErrorMessage(error) {
  const status = error.response?.status;

  if (status === 400) {
    return '이메일 주소 또는 인증 상태를 확인해주세요.';
  }

  if (status === 401) {
    return '로그인이 필요합니다.';
  }

  if (status === 409) {
    return '이미 다른 계정에서 사용 중인 이메일입니다.';
  }

  if (status === 429) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }

  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.';
}

function EmailEdit() {
  const username = sessionStorage.getItem('username');
  const [email, setEmail] = useState('');
  const [isVerificationPending, setIsVerificationPending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(username));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!username) {
      return;
    }

    let isCurrent = true;

    async function fetchEmailStatus() {
      try {
        const response = await api.get(`/users/${encodeURIComponent(username)}`);

        if (!isCurrent) {
          return;
        }

        const registeredEmail = response.data?.email || '';
        const emailVerified = Boolean(response.data?.email_verified);

        setEmail(registeredEmail);
        setIsVerified(emailVerified);
        setIsVerificationPending(Boolean(registeredEmail && !emailVerified));
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getEmailErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    fetchEmailStatus();

    return () => {
      isCurrent = false;
    };
  }, [username]);

  const clearFeedback = () => {
    setMessage('');
    setErrorMessage('');
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setIsVerificationPending(false);
    setIsVerified(false);
    clearFeedback();
  };

  const handleEmailRegister = async (event) => {
    event.preventDefault();
    clearFeedback();
    setIsSubmitting(true);

    try {
      await api.put('/email', { email: email.trim() });
      setIsVerificationPending(true);
      setIsVerified(false);
      setMessage('인증 메일을 발송했습니다. 메일의 인증 링크를 확인해주세요.');
    } catch (error) {
      setErrorMessage(getEmailErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationResend = async () => {
    clearFeedback();
    setIsSubmitting(true);

    try {
      await api.post('/email/verify-request');
      setMessage('인증 메일을 다시 발송했습니다.');
    } catch (error) {
      setErrorMessage(getEmailErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationCheck = async () => {
    clearFeedback();

    if (!username) {
      setErrorMessage('로그인이 필요합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.get(`/users/${encodeURIComponent(username)}`);

      if (response.data?.email_verified) {
        setIsVerified(true);
        setIsVerificationPending(false);
        setMessage('이메일 인증이 완료되었습니다.');
      } else {
        setErrorMessage('아직 이메일 인증이 완료되지 않았습니다.');
      }
    } catch (error) {
      setErrorMessage(getEmailErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="email-edit-loading" role="status">
        이메일 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <form className="email-edit" onSubmit={handleEmailRegister} aria-busy={isSubmitting}>
      <h2 className="email-edit__title">이메일 변경</h2>

      <div className="email-edit__field">
        <label className="email-edit__label" htmlFor="account-email">
          이메일 주소
        </label>
        <input
          className="email-edit__input"
          id="account-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="youremail@example.com"
          value={email}
          onChange={handleEmailChange}
          disabled={isSubmitting}
          required
        />
      </div>

      {!isVerificationPending && !isVerified && (
        <button className="email-edit__button email-edit__button--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '발송 중...' : '인증 메일 발송'}
        </button>
      )}

      {isVerificationPending && (
        <div className="email-edit__actions">
          <button
            className="email-edit__button email-edit__button--secondary"
            type="button"
            onClick={handleVerificationResend}
            disabled={isSubmitting}
          >
            인증 메일 재발송
          </button>
          <button
            className="email-edit__button email-edit__button--primary"
            type="button"
            onClick={handleVerificationCheck}
            disabled={isSubmitting}
          >
            인증 상태 확인
          </button>
        </div>
      )}

      {isVerified && (
        <div className="email-edit__verified" role="status">
          인증 완료
        </div>
      )}
      {message && (
        <div className="email-edit__message email-edit__message--success" role="status">
          {message}
        </div>
      )}
      {errorMessage && (
        <div className="email-edit__message email-edit__message--error" role="alert">
          {errorMessage}
        </div>
      )}
    </form>
  );
}

export default EmailEdit;
