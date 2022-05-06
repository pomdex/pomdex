import { useState, useRef } from "react";

const useStatus = (initialStatus) => {
  const persistentStatus = useRef(initialStatus);

  // On rerenders, start with the persisent status value
  const [statusState, setStatusState] = useState(persistentStatus.current);

  const setStatus = (newStatus) => {
    persistentStatus.current = newStatus;
    setStatusState(newStatus);
  }

  return [statusState, setStatus];
}

export default useStatus;