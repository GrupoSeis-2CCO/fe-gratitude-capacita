import Header from "./components/Header.jsx";
import StudentHeader from "./components/StudentHeader.jsx";
import Footer from "./components/Footer.jsx";
import MiniFooter from "./components/MiniFooter.jsx";
import ToastHub from "./components/ToastHub.jsx";

function Layout({ children, footerType = "full", headerType = "default" }) {
  return (
    <>
      {headerType === "student" ? <StudentHeader /> : <Header />}
        {children}
      {footerType === "mini" ? <MiniFooter /> : <Footer />}
      <ToastHub />
    </>
  );
}

export default Layout;
