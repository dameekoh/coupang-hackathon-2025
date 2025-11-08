import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import VoiceButton from './components/VoiceButton';
import MicIcon from './assets/mic.svg';

export default function App() {
  const [variant, setVariant] = useState<'primary' | 'secondary'>('primary');
  const [isHolding, setIsHolding] = useState(false);
  const startYRef = useRef(0);

  return (
    <div className="relative flex items-end justify-center min-h-screen pb-36">
      <div className="relative flex items-center justify-center">
        {/* Ellipse decoration that appears during hold */}
        <AnimatePresence>
          {isHolding && (
            <motion.div
              className="absolute"
              style={{
                width: '638px',
                height: '538px',
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #FFFFFF 23%, #ECE0FF 42%, #BEC8FF 58%)',
                zIndex: 0,
                bottom: '-269px',
                filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.15))',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Voice Button */}
        <div className="relative z-10">
          <VoiceButton
            icon={MicIcon}
            variant={variant}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.9}
            onTapStart={() => {
              setVariant('secondary');
              setIsHolding(true);
            }}
            onTap={() => {
              setVariant('primary');
              setIsHolding(false);
            }}
            onDragStart={(_event, info) => {
              setVariant('secondary');
              setIsHolding(true);
              startYRef.current = info.point.y;
            }}
            onDragEnd={(_event, info) => {
              setVariant('primary');
              setIsHolding(false);
              const deltaY = info.point.y - startYRef.current;

              if (deltaY < -50) {
                console.log('Released on Up');
              } else if (deltaY > 50) {
                console.log('Released on Bottom');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}