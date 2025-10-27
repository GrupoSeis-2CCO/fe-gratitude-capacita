import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import useHistory from "../hooks/useHistory.js";

export default function NavigationTracker({ children }) {
  const location = useLocation();
  const { push, peek } = useHistory();
  const lastProcessedPath = useRef(null);

  useEffect(() => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    const lastInStack = peek();

    if (
      lastProcessedPath.current === currentPath ||
      lastInStack === currentPath
    ) {
      return;
    }

    push(currentPath);
    lastProcessedPath.current = currentPath;
  }, [location.pathname, location.search, location.hash, push, peek]);

  return children;
}
