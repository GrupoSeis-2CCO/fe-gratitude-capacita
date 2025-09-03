import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import MiniFooter from "./components/MiniFooter.jsx";

function Layout({ children, footerType = "full" }) {
  return (
    <>
      <Header />
        {children}
      {footerType === "mini" ? <MiniFooter /> : <Footer />}
    </>
  );
}

export default Layout;
