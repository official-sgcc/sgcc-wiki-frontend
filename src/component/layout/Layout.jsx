import Footer from "./Footer";
import Body from "./Body";
import './Layout.css';
import Header from "./Header";
import { isWelcomePeriod } from "../page/welcome/WelcomeTimeSet";

/*

목적: Layout 컴포넌트

사용법: <Layout content={여기에 감쌀 컴포넌트} />

설명: content로 넘어오는 페이지 혹은 컴포넌트를 헤더와 푸터로 감싸서 표현

*/

function Layout({content}){
    const showWelcomeButton = isWelcomePeriod();

    return (
        <>
            <div id='entire' className={showWelcomeButton ? 'has-welcome-banner' : ''}>
                <Header/>
                <div id='main'>
                    {content}
                </div>
                <Footer />
            </div>
        </>
    );
}
export default Layout;
