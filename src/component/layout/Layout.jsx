import Category from "./Category";
import Footer from "./Footer";
import Body from "./Body";
import './Layout.css';
import Header from "./Header";

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