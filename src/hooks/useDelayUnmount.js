import { useState, useEffect } from "react";

// delayTime expected in milliseconds
const useDelayUnmount = (isMounted, delayTime) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (isMounted && !show) {
      setShow(true);
    } else if (!isMounted && show) {
      timeoutId = setTimeout(() => setShow(false), delayTime);
    }

    return () => clearTimeout(timeoutId);
  }, [isMounted, delayTime, show]);
  
  return show;
}

export default useDelayUnmount;