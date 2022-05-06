import { useState } from "react";

const useSignal = () => {
  const [signal, setSignalPayload] = useState({});

  const emitSignal = (payload = {}) => {
    if (typeof payload !== "object") {
      throw new Error('Signal payload must be of type "Object"');
    }
    setSignalPayload({...payload});
  }

  return [signal, emitSignal];
}

export default useSignal;