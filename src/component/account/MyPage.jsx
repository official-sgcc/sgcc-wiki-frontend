import { useEffect, useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiUser, FiShield, FiMail, FiFileText, FiEdit2, FiLock } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import api from '../../backend/axios.js'
import './MyPage.css'
import AccountStatus from './AccountStatus.jsx'
import EditList from './EditList.jsx'

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

  const displayName = user?.username || username;

  const emailContent = user?.email ? (
    <span className="account-email">
      <span className="account-email-address">{user.email}</span>
      <EmailVerificationStatus isVerified={Boolean(user.email_verified)} />
    </span>
  ) : '정보 없음';

  return ( 
    <div className="mypage-wrapper">
      <div className="mypage-container">
        {/* 상단 프로필 헤더 */}
        <div className="profileHero">
          <div className="profileAvatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="profileHello">Hello, {displayName}</div>
          <div className="profileRoleBadge">
            <FiShield size={12} />
            <span>{user?.permission || 'login_user'}</span>
          </div>
        </div>

        {/* 프로필 정보 + 액션 카드 */}
        <div className="profileMain">
          <div className="profileInfoCard">
            <div className="profileInfoTitle">프로필 정보</div>
            <div className="profileInfoList">
              <div className="infoItem">
                <div className="infoLabel">
                  <FiUser className="infoIcon" />
                  <span>아이디</span>
                </div>
                <div className="infoValue hasValue">{displayName}</div>
              </div>

              <div className="infoItem">
                <div className="infoLabel">
                  <FiShield className="infoIcon" />
                  <span>권한</span>
                </div>
                <div className="infoValue hasValue">{user?.permission || 'login_user'}</div>
              </div>

              <div className="infoItem">
                <div className="infoLabel">
                  <FiMail className="infoIcon" />
                  <span>Email</span>
                </div>
                <div className={`infoValue ${user?.email ? 'hasValue' : 'noValue'}`}>
                  {emailContent}
                </div>
              </div>

              <div className="infoItem">
                <div className="infoLabel">
                  <FiFileText className="infoIcon" />
                  <span>Bio</span>
                </div>
                <div className={`infoValue ${user?.bio ? 'hasValue' : 'noValue'}`}>
                  {user?.bio || '정보 없음'}
                </div>
              </div>
            </div>
          </div>

          <div className="profileActions">
            {/* 정보 수정: EditProfile 페이지로 이동하도록 Link로 변경 */}
            <Link className="actionCard blueCard" to="/edit-profile">
              <div className="actionIcon actionIconBlue">
                <FiEdit2 />
              </div>
              <div className="actionTitle">정보 수정</div>
              <div className="actionDesc">프로필 정보를 변경합니다</div>
            </Link>

            {/* 2단계 인증 */}
            <Link className="actionCard purpleCard" to="/two-factor">
              <div className="actionIcon actionIconPurple">
                <FiLock />
              </div>
              <div className="actionTitle">2단계 인증</div>
              <div className="actionDesc">계정 보안을 강화합니다</div>
            </Link>
          </div>
        </div>

        {/* 편집 목록 */}
        <div className="editListCard">
          <div className="editListHeader">
            <div className="profileInfoTitle" style={{ marginBottom: 0 }}>편집 목록</div>
            <span className="countPill">{editList.length}개</span>
          </div>
          <EditList edits={editList} />
        </div>
      </div>
    </div>
  )
}

export default MyPage