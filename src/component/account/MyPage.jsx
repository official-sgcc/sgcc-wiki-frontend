import { useEffect, useState } from 'react'
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import api from '../../backend/axios.js'
import './MyPage.css'
import AccountStatus from './AccountStatus.jsx'
import EditList from './EditList.jsx'
import EmailEdit from './EmailEdit.jsx'
import ShowPanel from './ShowPanel.jsx'

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

function EmailVerificationStatus({ isVerified }) {
  const Icon = isVerified ? FiCheckCircle : FiAlertCircle;
  const tooltip = isVerified
    ? '이메일이 인증되었습니다.'
    : '이메일이 인증되지 않았습니다.';

  return (
    <span
      className={`email-verification-status ${isVerified ? 'is-verified' : 'is-unverified'}`}
      tabIndex="0"
      aria-label={tooltip}
    >
      <Icon className="email-verification-icon" aria-hidden="true" />
      <span className="email-verification-tooltip" role="tooltip">
        {tooltip}
      </span>
    </span>
  );
}

function MyPage() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const username = sessionStorage.getItem(USERNAME_KEY);
  const [user, setUser] = useState(null);
  const [editList, setEditList] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(token && username));
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmailEditOpen, setIsEmailEditOpen] = useState(false);

  useEffect(() => {
    if (!token || !username) {
      return;
    }

    async function fetchUser() {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await api.get(`/users/${username}`);
        setUser(response.data);
        setEditList(response.data?.editList || response.data?.edit_versions || []);
      } catch (error) {
        const status = error.response?.status;
        if (status === 404) {
          setErrorMessage('사용자 정보를 찾을 수 없습니다.');
        } else if (status === 401) {
          setErrorMessage('로그인이 필요합니다.');
        } else {
          setErrorMessage('사용자 정보를 불러오지 못했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [token, username]);

  if (!token || !username) {
    return (
      <AccountStatus
        title="로그인이 필요합니다."
        message="상단 Login 버튼으로 로그인한 뒤 다시 확인해주세요."
      />
    )
  }

  if (isLoading) {
    return (
      <AccountStatus title="사용자 정보를 불러오는 중 . . ." />
    )
  }

  if (errorMessage) {
    return (
      <AccountStatus title="My Page" message={errorMessage} />
    )
  }

  const emailContent = user?.email ? (
    <span className="account-email">
      <span className="account-email-address">{user.email}</span>
      <EmailVerificationStatus isVerified={Boolean(user.email_verified)} />
    </span>
  ) : null;
  
  return ( 
    <div className="padding">
      <div className="accountName">
        Hello, {user?.username || username}
      </div>
      <ShowPanel title="아이디" content={user?.username || username} />
      <ShowPanel title="권한" content={user?.permission} />
      <ShowPanel title="Email" content={emailContent} />
      <ShowPanel title="Bio" content={user?.bio} />
      <button
        className="editbutton"
        type="button"
        onClick={() => setIsEmailEditOpen((isOpen) => !isOpen)}
      >
        {isEmailEditOpen ? '수정 닫기' : '정보 수정'}
      </button>
      {isEmailEditOpen && <EmailEdit />}
      <EditList edits={editList} />
    </div>
  )
}

export default MyPage
