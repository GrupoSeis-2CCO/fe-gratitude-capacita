import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import useHistory from "../hooks/useHistory.js";

const COOKIE_NAME = "last_page";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
}

function setCookie(name, value) {
  document.cookie = `${name}=${value}; path=/; max-age=86400; SameSite=Strict`;
}

export default function NavigationTracker({ children }) {
  const location = useLocation();
  const { push, peek } = useHistory();

  useLayoutEffect(() => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    const cookieValue = getCookie(COOKIE_NAME);

    if (cookieValue && cookieValue !== currentPath) {
      const lastInStack = peek();
      if (lastInStack !== cookieValue) {
        push(cookieValue);
      }
    }

    setCookie(COOKIE_NAME, currentPath);
  }, [location.pathname, location.search, location.hash, push, peek]);

  return children;
}
