import { useLayoutEffect, useRef } from "react";
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
  const lastPushedRef = useRef(null);

  useLayoutEffect(() => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    const previousPath = getCookie(COOKIE_NAME); // what we consider the last location before this one

    // If visiting a course-scoped route, remember the course id to keep navigation context
    try {
      const courseMatch = location.pathname.match(/^\/cursos\/(\d+)(?:$|\/)/);
      if (courseMatch && courseMatch[1]) {
        sessionStorage.setItem('last_course_id', courseMatch[1]);
        // also keep a cookie for interoperability
        setCookie('last_course_id', courseMatch[1]);
      }
    } catch (e) { /* noop */ }

    // Remember where UserPage was reached from: class users list or access page
    try {
      const classUsersMatch = location.pathname.match(/^\/cursos\/(\d+)\/participantes(?:$|\/)/);
      if (classUsersMatch && classUsersMatch[1]) {
        sessionStorage.setItem('last_userpage_source', 'classUsers');
        sessionStorage.setItem('last_userpage_source_course', classUsersMatch[1]);
        setCookie('last_userpage_source', 'classUsers');
        setCookie('last_userpage_source_course', classUsersMatch[1]);
      } else if (location.pathname === '/acessos' || location.pathname.startsWith('/acessos/')) {
        sessionStorage.setItem('last_userpage_source', 'accessPage');
        setCookie('last_userpage_source', 'accessPage');
        // clear any course-specific source when coming from access page
        sessionStorage.removeItem('last_userpage_source_course');
        try { document.cookie = 'last_userpage_source_course=; path=/; max-age=0'; } catch (_) { /* noop */ }
      }
    } catch (e) { /* noop */ }

    // Update cookie for next navigation at the end
    // Guard conditions to avoid uncontrolled stack growth:
    // 1. previousPath exists and differs from current
    // 2. previousPath is not already the last element
    // 3. previousPath wasn't just pushed in the last effect run
    // 4. Ignore pushes of repeated transient routes (e.g. /login multiple times)
    const lastInStack = peek();
    const shouldIgnore = (p) => !p || p === currentPath || p === lastInStack || p === lastPushedRef.current;

    if (!shouldIgnore(previousPath)) {
      // Deduplicate older occurrences: remove all previousPath instances except tail
      // We do this by reading sessionStorage directly (kept in useHistory hook) to avoid exposing internal state.
      try {
        const raw = sessionStorage.getItem("history_stack");
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            const filtered = arr.filter((item, idx) => item !== previousPath || idx === arr.length - 1);
            if (filtered.length !== arr.length) {
              sessionStorage.setItem("history_stack", JSON.stringify(filtered));
            }
          }
        }
      } catch (_) { /* noop */ }
      push(previousPath);
      lastPushedRef.current = previousPath;
      // Enforce a max stack size (prune head if exceeded)
      try {
        const raw = sessionStorage.getItem("history_stack");
        if (raw) {
          const arr = JSON.parse(raw);
          const MAX = 100;
          if (Array.isArray(arr) && arr.length > MAX) {
            const pruned = arr.slice(arr.length - MAX);
            sessionStorage.setItem("history_stack", JSON.stringify(pruned));
          }
        }
      } catch (_) { /* noop */ }
    }

    setCookie(COOKIE_NAME, currentPath);
  }, [location.pathname, location.search, location.hash, push, peek]);

  return children;
}
