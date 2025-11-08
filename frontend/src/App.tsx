import { useState, useRef } from 'react';
import VoiceButton from './components/VoiceButton';
import MicIcon from './assets/mic.svg';

export default function App() {
  const [variant, setVariant] = useState<'primary' | 'secondary'>('primary');
  const startYRef = useRef(0);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <VoiceButton
        icon={MicIcon}
        variant={variant}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.9}
        onTapStart={() => setVariant('secondary')}
        onTap={() => setVariant('primary')}
        onDragStart={(_event, info) => {
          setVariant('secondary');
          startYRef.current = info.point.y;
        }}
        onDragEnd={(_event, info) => {
          setVariant('primary');
          const deltaY = info.point.y - startYRef.current;

          if (deltaY < -50) {
            console.log('Released on Up');
          } else if (deltaY > 50) {
            console.log('Released on Bottom');
          }
        }}
      />
    </div>
  );
}