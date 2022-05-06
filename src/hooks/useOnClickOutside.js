import { useEffect } from "react";

const useOnClickOutside = (ref, handler) => {
  useEffect(
    () => {
      const listener = (event) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(event);
      };
      document.addEventListener("mouseup", listener);
      document.addEventListener("touchend", listener);
      return () => {
        document.removeEventListener("mouseup", listener);
        document.removeEventListener("touchend", listener);
      };
    },
    [ref, handler]
  );
}

export default useOnClickOutside;