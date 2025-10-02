import React from 'react';

interface SpoilerProps {
  children: React.ReactNode;
}

const Spoiler: React.FC<SpoilerProps> = ({ children }) => {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <span
      className={revealed ? '' : 'bg-gray-300 dark:bg-gray-700 text-transparent select-none cursor-pointer rounded px-2 py-0.5'}
      onClick={() => setRevealed(true)}
      title={revealed ? undefined : 'Click to reveal spoiler'}
      style={revealed ? {} : { filter: 'blur(0.18em)' }}
    >
      {revealed ? children : 'Spoiler (click to reveal)'}
    </span>
  );
};

export default Spoiler;