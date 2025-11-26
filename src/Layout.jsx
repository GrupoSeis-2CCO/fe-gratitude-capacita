import Header from "./components/Header.jsx";
import StudentHeader from "./components/StudentHeader.jsx";
import Footer from "./components/Footer.jsx";
import MiniFooter from "./components/MiniFooter.jsx";
import ToastHub from "./components/ToastHub.jsx";
import NavigationTracker from "./components/NavigationTracker.jsx";

function Layout({ children, footerType = "full", headerType = "default" }) {
  return (
    <NavigationTracker>
      <div className="min-h-screen flex flex-col bg-white">
        {headerType === "student" ? <StudentHeader /> : <Header />}
        <main className="flex-1 w-full">{children}</main>
        {footerType === "mini" ? <MiniFooter /> : <Footer />}
        <ToastHub />
      </div>
    </NavigationTracker>
  );
}

export default Layout;
