// Create a useInView hook for lazy loading
import { useState, useEffect, useRef } from 'react';

function useInView(options = {}) {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
      
      if (entry.isIntersecting && !hasBeenInView) {
        setHasBeenInView(true);
      }
    }, options);
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasBeenInView, options]);

  return { ref, isInView, hasBeenInView };
}

export default useInView;