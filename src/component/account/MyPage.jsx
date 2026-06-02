import { useEffect, useState } from 'react'
import api from '../../backend/axios.js'
import './MyPage.css'
import AccountStatus from './AccountStatus.jsx'
import EditList from './EditList.jsx'
import ShowPanel from './ShowPanel.jsx'

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

function MyPage() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const username = sessionStorage.getItem(USERNAME_KEY);
  const [user, setUser] = useState(null);
  const [editList, setEditList] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(token && username));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token || !username) {
      setIsLoading(false);
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
  
  return ( 
    <div className="padding">
      <div className="accountName">
        Hello, {user?.username || username}
      </div>
      <ShowPanel title="아이디" content={user?.username || username} />
      <ShowPanel title="권한" content={user?.permission || '정보 없음'} />
      <ShowPanel title="Email" content={user?.email || '정보 없음'} />
      <ShowPanel title="Bio" content={user?.bio || '정보 없음'} />
      <EditList edits={editList} />
    </div>
  )
}

export default MyPage
