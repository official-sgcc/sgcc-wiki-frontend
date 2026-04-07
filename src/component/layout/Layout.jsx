import Category from "./Category";
import Footer from "./Footer.jsx";

function Layout({content}){
    return (
        <>
            <Category />
            <content />
            <Footer />
        </>
    );
}
export default Layout;