import { Link } from "react-router-dom";
import './WelcomeHeaderButton.css'

function WelcomeHeaderButton() {
    return (
        <Link to='/welcome' className='welcomebutton'>
            (~9/10) 신입부원 모집중!
        </Link>
    )
}

export default WelcomeHeaderButton;