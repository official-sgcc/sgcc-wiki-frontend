import { Link } from "react-router-dom";
import './WelcomeHeaderButton.css'

function WelcomeHeaderButton() {
    return (
        <Link to='/welcome' className='welcomebutton'>
            🎉 신입부원 모집중! (~9/4)
        </Link>
    )
}

export default WelcomeHeaderButton;
