import Category from "./Category";
import Footer from "./Footer";
import './Layout.css';
import Header from "./Header";

function Layout({content}){
    return (
        <>
            <div id='entire'>
                <Header/>
                <Category />
                <div id='main'>
                    <content />
                </div>
                <Footer />
            </div>
        </>
    );
}
export default Layout;