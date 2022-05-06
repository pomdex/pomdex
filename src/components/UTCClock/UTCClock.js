import { useState, useEffect } from 'react';
import * as styles from "./UTCClock.module.css"

const UTCClock = () => {

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(
                    () => setTime(new Date()),
                    1000
                  );
    
    return () => clearTimeout(timer);
  }, []);

  const formatTime = () => {
    let hours = time.getUTCHours();
    let minutes = time.getUTCMinutes();
    let seconds = time.getUTCSeconds();
    
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
  }

  return(
    <div className={styles.time}>{formatTime() + " UTC"}</div>
  );
}

export default UTCClock