import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

function Layout({ children }) {
  return (
    <>
      <Header />
        {children}
      <Footer />
    </>
  );
}

export default Layout;
