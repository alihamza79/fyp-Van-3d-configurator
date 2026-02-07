import { useEffect } from 'react';

const useClickOutside = (ref, onClose) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose(); // Call onClose if the click is outside the ref
      }
    };

    window.addEventListener('click', handleClickOutside); // Add event listener

    return () => {
      window.removeEventListener('click', handleClickOutside); // Clean up the event listener
    };
  }, [ref, onClose]);
};

export default useClickOutside; 