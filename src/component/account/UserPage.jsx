import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../backend/axios.js'
import './UserPage.css'
import ShowPanel from './ShowPanel.jsx'

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

function UserPage() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const myusername = sessionStorage.getItem(USERNAME_KEY);
  const { userID } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token && myusername));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token || !myusername) {
      setIsLoading(false);
      return;
    }

    async function fetchUser() {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await api.get(`/users/${userID}`);
        setUser(response.data);
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
  }, [token, myusername, userID]);

  if (!token || !myusername) {
    return (
      <div className="padding">
        <div className="accountName">로그인이 필요합니다.</div>
        <p className="accountNotice">상단 Login 버튼으로 로그인한 뒤 다시 확인해주세요.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="padding">
        <div className="accountName">사용자 정보를 불러오는 중 . . .</div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="padding">
        <div className="accountName">{userID}'s Page</div>
        <p className="accountNotice">{errorMessage}</p>
      </div>
    )
  }
  
  return ( 
	<div className="padding">
      <div className="accountName">{userID}'s Page</div>
      <ShowPanel title="아이디" content={user?.username || userID} />
    </div>
  )
}

export default UserPage