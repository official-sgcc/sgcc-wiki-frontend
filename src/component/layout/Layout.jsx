import Category from "./Category";
import Footer from "./Footer";
import './Layout.css';

function Layout({content}){
    return (
        <>
            <div id='entire'>
                <Category />
                <div id='main'>
                    <content />
                    <Footer />
                </div>
            </div>
        </>
    );
}
export default Layout;