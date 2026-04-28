import Category from "./Category";
import Footer from "./Footer";
import Body from "./Body";
import './Layout.css';

function Layout({content}){
    return (
        <>
            <div id='entire'>
                <Category />
                <div id='main'>

                    <Body>
                        
                    </Body>
                    <content />
                    <Footer />
                </div>
            </div>
        </>
    );
}
export default Layout;