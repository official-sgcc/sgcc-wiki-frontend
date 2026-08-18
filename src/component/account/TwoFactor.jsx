import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiCopy,
  FiKey,
  FiShield,
  FiSmartphone,
} from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../backend/axios.js';
import './TwoFactor.css';

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

function getErrorMessage(error, action) {
  const status = error.response?.status;

  if (status === 401) {
    return '로그인이 만료되었습니다. 다시 로그인해주세요.';
  }

  if (status === 429) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }

  if (status === 400 && action === 'enable') {
    return '인증 코드가 올바르지 않거나 만료되었습니다.';
  }

  if (status === 400 && action === 'disable') {
    return '인증 코드가 올바르지 않거나 이미 사용되었습니다.';
  }

  if (status === 400 && action === 'setup') {
    return '이미 2단계 인증이 활성화되어 있거나 설정을 시작할 수 없습니다.';
  }

  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.';
}

function TwoFactor() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const username = sessionStorage.getItem(USERNAME_KEY);
  const [isEnabled, setIsEnabled] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(token && username));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token || !username) {
      return;
    }

    let isCurrent = true;

    async function fetchTwoFactorStatus() {
      try {
        const response = await api.get(`/users/${encodeURIComponent(username)}`);

        if (isCurrent) {
          setIsEnabled(Boolean(response.data?.totp_enabled));
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error, 'status'));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    fetchTwoFactorStatus();

    return () => {
      isCurrent = false;
    };
  }, [token, username]);

  const clearFeedback = () => {
    setMessage('');
    setErrorMessage('');
  };

  const handleCodeChange = (event) => {
    setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
    clearFeedback();
  };

  const handleSetup = async () => {
    clearFeedback();
    setIsSubmitting(true);

    try {
      const response = await api.post('/2fa/setup');
      const secret = response.data?.secret;
      const otpauthUri = response.data?.otpauth_uri;

      if (!secret || !otpauthUri) {
        throw new Error('Invalid 2FA setup response');
      }

      setSetupData({ secret, otpauthUri });
      setCode('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'setup'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnable = async (event) => {
    event.preventDefault();
    clearFeedback();

    if (!/^\d{6}$/.test(code)) {
      setErrorMessage('인증앱에 표시된 6자리 코드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/2fa/enable', { code });
      setIsEnabled(true);
      setSetupData(null);
      setCode('');
      setMessage('2단계 인증이 활성화되었습니다.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'enable'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisable = async (event) => {
    event.preventDefault();
    clearFeedback();

    if (!/^\d{6}$/.test(code)) {
      setErrorMessage('인증앱에 표시된 6자리 코드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/2fa/disable', { code });
      setIsEnabled(false);
      setCode('');
      setMessage('2단계 인증이 비활성화되었습니다.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'disable'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySecret = async () => {
    if (!setupData?.secret) {
      return;
    }

    clearFeedback();

    try {
      await navigator.clipboard.writeText(setupData.secret);
      setMessage('설정 키를 복사했습니다.');
    } catch {
      setErrorMessage('설정 키를 복사하지 못했습니다. 직접 선택해 복사해주세요.');
    }
  };

  if (!token || !username) {
    return (
      <main className="two-factor-page">
        <Link className="two-factor__back-link" to="/mypage">
          <FiArrowLeft aria-hidden="true" />
          My Page
        </Link>
        <section className="two-factor__panel two-factor__panel--centered">
          <FiAlertCircle className="two-factor__empty-icon" aria-hidden="true" />
          <h1 className="two-factor__title">로그인이 필요합니다</h1>
          <p className="two-factor__description">
            로그인한 뒤 2단계 인증을 설정할 수 있습니다.
          </p>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="two-factor-page">
        <div className="two-factor__loading" role="status">
          2단계 인증 상태를 불러오는 중...
        </div>
      </main>
    );
  }

  return (
    <main className="two-factor-page">
      <Link className="two-factor__back-link" to="/mypage">
        <FiArrowLeft aria-hidden="true" />
        My Page
      </Link>

      <header className="two-factor__header">
        <div className="two-factor__heading-icon" aria-hidden="true">
          <FiShield />
        </div>
        <div>
          <h1 className="two-factor__title">2단계 인증</h1>
          <p className="two-factor__description">
            인증앱에서 생성한 일회용 코드로 계정을 한 번 더 확인합니다.
          </p>
        </div>
      </header>

      <section className="two-factor__panel" aria-busy={isSubmitting}>
        <div className={`two-factor__status ${isEnabled ? 'is-enabled' : 'is-disabled'}`}>
          {isEnabled ? <FiCheckCircle aria-hidden="true" /> : <FiAlertCircle aria-hidden="true" />}
          <span>{isEnabled ? '활성화됨' : '비활성화됨'}</span>
        </div>

        {!isEnabled && !setupData && (
          <div className="two-factor__start">
            <h2>인증앱 연결</h2>
            <p>
              설정을 시작하면 새 QR 코드와 수동 입력용 설정 키가 발급됩니다.
            </p>
            <button
              className="two-factor__button two-factor__button--primary"
              type="button"
              onClick={handleSetup}
              disabled={isSubmitting}
            >
              <FiSmartphone aria-hidden="true" />
              {isSubmitting ? '준비 중...' : '설정 시작'}
            </button>
          </div>
        )}

        {!isEnabled && setupData && (
          <div className="two-factor__setup-layout">
            <div className="two-factor__qr-section">
              <div className="two-factor__qr-frame">
                <QRCodeSVG
                  value={setupData.otpauthUri}
                  size={220}
                  level="M"
                  marginSize={4}
                  title="2단계 인증 설정 QR 코드"
                />
              </div>
              <p className="two-factor__qr-caption">
                인증앱으로 QR 코드를 스캔하세요.
              </p>
            </div>

            <div className="two-factor__steps">
              <div className="two-factor__step">
                <span className="two-factor__step-number">1</span>
                <div>
                  <h2>인증앱에 등록</h2>
                  <p>QR 스캔이 어렵다면 아래 설정 키를 직접 입력하세요.</p>
                </div>
              </div>

              <div className="two-factor__secret">
                <FiKey aria-hidden="true" />
                <code>{setupData.secret}</code>
                <button
                  className="two-factor__icon-button"
                  type="button"
                  onClick={handleCopySecret}
                  title="설정 키 복사"
                  aria-label="설정 키 복사"
                >
                  <FiCopy aria-hidden="true" />
                </button>
              </div>

              <form className="two-factor__form" onSubmit={handleEnable}>
                <div className="two-factor__step">
                  <span className="two-factor__step-number">2</span>
                  <div>
                    <label className="two-factor__label" htmlFor="two-factor-enable-code">
                      인증 코드 확인
                    </label>
                    <p>인증앱에 표시된 현재 6자리 코드를 입력하세요.</p>
                  </div>
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
                  value={code}
                  onChange={handleCodeChange}
                  disabled={isSubmitting}
                  required
                />
                <button
                  className="two-factor__button two-factor__button--primary"
                  type="submit"
                  disabled={isSubmitting || code.length !== 6}
                >
                  <FiShield aria-hidden="true" />
                  {isSubmitting ? '확인 중...' : '2단계 인증 활성화'}
                </button>
              </form>
            </div>
          </div>
        )}

        {isEnabled && (
          <form className="two-factor__disable" onSubmit={handleDisable}>
            <h2>2단계 인증 비활성화</h2>
            <p>
              비활성화하려면 인증앱에 표시된 현재 코드를 입력하세요.
            </p>
            <label className="two-factor__label" htmlFor="two-factor-disable-code">
              인증 코드
            </label>
            <input
              className="two-factor__code-input"
              id="two-factor-disable-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength="6"
              placeholder="000000"
              value={code}
              onChange={handleCodeChange}
              disabled={isSubmitting}
              required
            />
            <button
              className="two-factor__button two-factor__button--danger"
              type="submit"
              disabled={isSubmitting || code.length !== 6}
            >
              <FiAlertCircle aria-hidden="true" />
              {isSubmitting ? '확인 중...' : '2단계 인증 비활성화'}
            </button>
          </form>
        )}

        {message && (
          <div className="two-factor__message two-factor__message--success" role="status">
            <FiCheckCircle aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}
        {errorMessage && (
          <div className="two-factor__message two-factor__message--error" role="alert">
            <FiAlertCircle aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}
      </section>
    </main>
  );
}

export default TwoFactor;
