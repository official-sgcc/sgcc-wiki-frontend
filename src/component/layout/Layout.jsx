import Category from "./Category";
import Footer from "./Footer";
import Body from "./Body";
import './Layout.css';
import Header from "./Header";

/*

목적: Layout 컴포넌트

사용법: <Layout content={여기에 감쌀 컴포넌트} />

설명: content로 넘어오는 페이지 혹은 컴포넌트를 헤더와 푸터로 감싸서 표현

*/

function Layout({content}){
    return (
        <>
            <div id='entire'>
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