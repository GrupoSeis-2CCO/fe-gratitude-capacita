import { useEffect, useState, useCallback, useRef } from "react";

const STORAGE_KEY = "history_stack";

function loadFromStorage() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(stack) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
  } catch (e) {
    console.error("Erro ao salvar histórico:", e);
  }
}

export default function useHistory() {
  const [stack, setStack] = useState(() => loadFromStorage());
  const stackRef = useRef(stack);

  useEffect(() => {
    stackRef.current = stack;
    saveToStorage(stack);
    console.log("📚 Stack atual:", stack);
  }, [stack]);

  const size = useCallback(() => {
    return stackRef.current.length;
  }, []);

  const isEmpty = useCallback(() => {
    return stackRef.current.length === 0;
  }, []);

  const push = useCallback((page) => {
    setStack((currentStack) => {
      const newStack = [...currentStack, page];
      console.log("➕ Push:", page);
      return newStack;
    });
  }, []);

  const pop = useCallback(() => {
    let popped;
    setStack((currentStack) => {
      if (currentStack.length === 0) {
        popped = undefined;
        return currentStack;
      }
      popped = currentStack[currentStack.length - 1];
      const newStack = currentStack.slice(0, -1);
      console.log("➖ Pop:", popped);
      return newStack;
    });
    return popped;
  }, []);

  const peek = useCallback(() => {
    return stackRef.current.length > 0
      ? stackRef.current[stackRef.current.length - 1]
      : undefined;
  }, []);

  const clear = useCallback(() => {
    setStack([]);
    sessionStorage.removeItem(STORAGE_KEY);
    console.log("🗑️ Histórico limpo");
  }, []);

  return {
    size,
    isEmpty,
    push,
    pop,
    peek,
    clear,
  };
}
