import React from 'react';

const useKeyPress = (targetKey: string, callback: () => void) => {
  const downHandler = (event: KeyboardEvent) => {
    event.preventDefault();
    const { key } = event;
    if (key === targetKey) {
      callback();
    }
  };
  React.useEffect(() => {
    window.addEventListener('keydown', downHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
    };
  }, []);
};
export default useKeyPress;
