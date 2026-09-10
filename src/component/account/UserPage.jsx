import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiFileText, FiUser } from 'react-icons/fi'
import api from '../../backend/axios.js'
import './MyPage.css'
import './UserPage.css'
import AccountStatus from './AccountStatus.jsx'
import EditList from './EditList.jsx'

function getEditList(data) {
  if (Array.isArray(data?.edit_versions)) {
    return data.edit_versions;
  }

  if (Array.isArray(data?.editList)) {
    return data.editList;
  }

  return [];
}

function UserPage() {
  const { userID } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [editList, setEditList] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUser() {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await api.get(`/users/${encodeURIComponent(userID)}`, {signal: controller.signal});

        setUser(response.data);
        setEditList(getEditList(response.data));
      } catch (error) {
        if (controller.signal.aborted) { return; }
        const status = error.response?.status;
        if (status === 404) {
          setErrorMessage('사용자 정보를 찾을 수 없습니다.');
        } else if (status === 401) {
          setErrorMessage('로그인이 필요합니다.');
        } else {
          setErrorMessage('사용자 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchUser();

    return () => controller.abort();
  }, [userID]);

  if (isLoading) {
    return (
      <AccountStatus title="사용자 정보를 불러오는 중 . . ." />
    )
  }

  if (errorMessage) {
    return (
      <AccountStatus title={`${userID}'s Page`} message={errorMessage} />
    )
  }

  const displayName = user?.username || userID;

  return (
    <div className="mypage-wrapper userpage-wrapper">
      <div className="mypage-container">
        <div className="userpage-profile-layout">
          <div className="profileHero userpage-profile-hero">
            <div className="profileAvatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="profileHello">{displayName}</div>
          </div>

          <div className="profileInfoCard userpage-profile-card">
            <div className="profileInfoTitle">프로필 정보</div>
            <div className="profileInfoList">
              <div className="infoItem">
                <div className="infoLabel">
                  <FiUser className="infoIcon" aria-hidden="true" />
                  <span>아이디</span>
                </div>
                <div className="infoValue hasValue">{displayName}</div>
              </div>

              <div className="infoItem">
                <div className="infoLabel">
                  <FiFileText className="infoIcon" aria-hidden="true" />
                  <span>Bio</span>
                </div>
                <div className={`infoValue ${user?.bio ? 'hasValue' : 'noValue'}`}>
                  {user?.bio || '정보 없음'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="editListCard">
          <div className="editListHeader">
            <div className="profileInfoTitle">편집 목록</div>
            <span className="countPill">{editList.length}개</span>
          </div>
          <EditList edits={editList} />
        </div>
      </div>
    </div>
  )
}

export default UserPage
