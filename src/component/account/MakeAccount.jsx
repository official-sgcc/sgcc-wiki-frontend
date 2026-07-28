import { useState } from "react";
import api from "../../backend/axios";
import "./MakeAccount.css"

// 회원가입에서 이름과 학번도 입력하게 하고 싶다면
// 이 코드에서 {/* 와 */} 를 모두 없애고
// 이름과 학번도 api에 보내게 한 다음에
// 백엔드 api에서 이름과 학번도 받고
// 백엔드에서 중복 방지와 본인 확인 코드를 구현하면 된다.
// 허가제로 하고 싶으면 그것도 백엔드에서 만들고.

function MakeAccount() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    {/*
    const [name, setName] = useState('');
    const [hakbun, setHakbun] = useState('');
    */}
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleMakeAccount = async (event) => {
        event.preventDefault();
        if (password.length < 8) {
            setErrorMessage("비밀번호는 8자 이상이어야 합니다.")
            return;
        }
        setErrorMessage('');
        setIsSubmitting(true);
        
        try {
            await api.post('/register', { username:username, password: password });
            alert("회원으로 등록되었습니다. 로그인을 시도해 보세요!");
        }
        catch (error) {
            if (error.response?.status === 400) {
                setErrorMessage("이 아이디는 사용할 수 없습니다.");
            }
            else {
                setErrorMessage("알 수 없는 오류가 발생했습니다.");
            }
        }
        finally {
            setIsSubmitting(false);
        }
    }

    return <>
        <h2 className="signup-title">회원가입</h2>
        <form className="signup-form" onSubmit={handleMakeAccount}>
            {/*
            <input
                type="text"
                placeholder="이름"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
            />
            <input
                type="text"
                placeholder="학번"
                value={hakbun}
                onChange={(event) => setHakbun(event.target.value)}
                required
            />
            */}
            <input
                className="signup-id-input"
                type="text"
                placeholder="아이디"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
            />
            <input
                className="signup-pw-input"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
            />
            <button className="signup-submit-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : '회원가입 신청'}
            </button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
    </>
}

export default MakeAccount;

