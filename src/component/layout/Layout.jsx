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
                <Category />
                <div id='main'>

                    <Body>
                        
                    </Body>
                    <content />
                </div>
                <Footer />
            </div>
        </>
    );
}
export default Layout;