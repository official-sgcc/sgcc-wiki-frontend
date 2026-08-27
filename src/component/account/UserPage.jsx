import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../backend/axios.js'
import './UserPage.css'
import AccountStatus from './AccountStatus.jsx'
import EditList from './EditList.jsx'
import ShowPanel from './ShowPanel.jsx'

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

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
  const token = sessionStorage.getItem(TOKEN_KEY);
  const myusername = sessionStorage.getItem(USERNAME_KEY);
  const { userID } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token && myusername));
  const [errorMessage, setErrorMessage] = useState('');
  const [editList, setEditList] = useState([]);

  useEffect(() => {
    if (!token || !myusername) {
      return;
    }

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
  }, [token, myusername, userID]);

  if (!token || !myusername) {
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
      <AccountStatus title={`${userID}'s Page`} message={errorMessage} />
    )
  }

  return ( 
	<div className="padding">
      <div className="accountName">{userID}'s Page</div>
      <ShowPanel title="아이디" content={user?.username || userID} />
      <ShowPanel title="권한" content={user?.permission || '정보 없음'} />
      <ShowPanel title="Bio" content={user?.bio || '정보 없음'} />
      {user?.email && <ShowPanel title="Email" content={user.email} />}
      <EditList edits={editList} />
    </div>
  )
}

export default UserPage
