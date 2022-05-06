import { useState, useEffect } from "react";

const useMatchMedia = (screenSizeQuery) => {
  const [ queryMatches, setQueryMatches ] = 
    useState(window.matchMedia(screenSizeQuery).matches);

    const handleMatchMedia = (event) => {
      setQueryMatches(event.matches);
    }

    useEffect(() => {
      window.matchMedia(screenSizeQuery)
            .addEventListener('change', handleMatchMedia);
  
      return () => {
        window.matchMedia(screenSizeQuery)
              .removeEventListener('change', handleMatchMedia);
      };
    }, [screenSizeQuery]);

  return queryMatches;
}

export default useMatchMedia;