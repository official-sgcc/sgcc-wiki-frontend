import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiEdit3,
  FiFileText,
  FiMail,
  FiSave,
  FiUser,
} from 'react-icons/fi';
import api from '../../backend/axios.js';
import './EditProfile.css';

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

function getErrorMessage(error) {
  const status = error.response?.status;

  if (status === 401) {
    return '로그인이 만료되었습니다. 다시 로그인해주세요.';
  }

  if (status === 429) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }

  if (status === 400) {
    return '입력한 정보가 올바르지 않습니다. 다시 확인해주세요.';
  }

  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.';
}

function EditProfile() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const username = sessionStorage.getItem(USERNAME_KEY);

  const [formData, setFormData] = useState({
    email: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(Boolean(token && username));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token || !username) {
      return;
    }

    let isCurrent = true;

    async function fetchUserData() {
      try {
        const response = await api.get(`/users/${encodeURIComponent(username)}`);

        if (isCurrent && response.data) {
          setFormData({
            email: response.data.email || '',
            bio: response.data.bio || '',
          });
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    fetchUserData();

    return () => {
      isCurrent = false;
    };
  }, [token, username]);

  const clearFeedback = () => {
    setMessage('');
    setErrorMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFeedback();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearFeedback();
    setIsSubmitting(true);

    try {
      await api.patch(`/users/${encodeURIComponent(username)}`, formData);
      setMessage('프로필 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !username) {
    return (
      <main className="edit-profile-page">
        <Link className="edit-profile__back-link" to="/mypage">
          <FiArrowLeft aria-hidden="true" />
          My Page
        </Link>
        <section className="edit-profile__panel edit-profile__panel--centered">
          <FiAlertCircle className="edit-profile__empty-icon" aria-hidden="true" />
          <h1 className="edit-profile__title">로그인이 필요합니다</h1>
          <p className="edit-profile__description">
            로그인한 뒤 회원 정보를 수정할 수 있습니다.
          </p>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="edit-profile-page">
        <div className="edit-profile__loading" role="status">
          회원 정보를 불러오는 중...
        </div>
      </main>
    );
  }

  return (
    <main className="edit-profile-page">
      <Link className="edit-profile__back-link" to="/mypage">
        <FiArrowLeft aria-hidden="true" />
        My Page
      </Link>

      <header className="edit-profile__header">
        <div className="edit-profile__heading-icon" aria-hidden="true">
          <FiEdit3 />
        </div>
        <div>
          <h1 className="edit-profile__title">프로필 정보 수정</h1>
          <p className="edit-profile__description">
            계정의 이메일 주소 및 한 줄 소개(Bio)를 변경할 수 있습니다.
          </p>
        </div>
      </header>

      <section className="edit-profile__panel" aria-busy={isSubmitting}>
        <form className="edit-profile__form" onSubmit={handleSubmit}>
          {/* 아이디 (읽기 전용) */}
          <div className="edit-profile__field">
            <label className="edit-profile__label" htmlFor="edit-profile-username">
              <FiUser aria-hidden="true" />
              <span>아이디</span>
            </label>
            <input
              className="edit-profile__input edit-profile__input--disabled"
              id="edit-profile-username"
              type="text"
              value={username}
              disabled
            />
            <p className="edit-profile__help-text">아이디는 변경할 수 없습니다.</p>
          </div>

          {/* 이메일 */}
          <div className="edit-profile__field">
            <label className="edit-profile__label" htmlFor="edit-profile-email">
              <FiMail aria-hidden="true" />
              <span>이메일</span>
            </label>
            <input
              className="edit-profile__input"
              id="edit-profile-email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {/* Bio */}
          <div className="edit-profile__field">
            <label className="edit-profile__label" htmlFor="edit-profile-bio">
              <FiFileText aria-hidden="true" />
              <span>한 줄 소개 (Bio)</span>
            </label>
            <textarea
              className="edit-profile__textarea"
              id="edit-profile-bio"
              name="bio"
              rows="4"
              placeholder="자신을 소개하는 문구를 입력하세요."
              value={formData.bio}
              onChange={handleChange}
              disabled={isSubmitting}
              maxLength="200"
            />
          </div>

          <button
            className="edit-profile__button edit-profile__button--primary"
            type="submit"
            disabled={isSubmitting}
          >
            <FiSave aria-hidden="true" />
            {isSubmitting ? '저장 중...' : '변경 사항 저장'}
          </button>
        </form>

        {message && (
          <div className="edit-profile__message edit-profile__message--success" role="status">
            <FiCheckCircle aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}
        {errorMessage && (
          <div className="edit-profile__message edit-profile__message--error" role="alert">
            <FiAlertCircle aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}
      </section>
    </main>
  );
}

export default EditProfile;