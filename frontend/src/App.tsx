import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import VoiceButton from './components/VoiceButton';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import ProductCard from './components/ProductCard';
import VoicePrompt from './components/VoicePrompt';
import CartSummary from './components/CartSummary';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useCart } from './hooks/useCart';
import type { Product } from './types/product';
import MicIcon from './assets/mic.svg';

// Mock product data (will be replaced with API call based on transcript)
const MOCK_PRODUCT: Product = {
  id: '1',
  name: 'Frozen Broccoli Mix',
  nameKo: '브로컬리 믹스 (냉동), 1kg, 1개',
  image: 'https://images.unsplash.com/photo-1628773822990-202f1c852074?w=500&h=500&fit=crop',
  price: 4600,
  pricePerUnit: '100g당 460원',
  rating: 4.8,
  reviewCount: 1634,
  origin: '원산지: 상품 상세설명 참조',
  weight: '1kg',
  quantity: 1,
};

export default function App() {
  const {
    isRecording,
    isProcessing,
    transcript,
    interimTranscript,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useVoiceRecorder();

  const { itemCount, totalPrice, addToCart } = useCart();
  const [showProduct, setShowProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // When processing ends, show the product
  useEffect(() => {
    if (!isProcessing && transcript && !showProduct) {
      // In real app, fetch product based on transcript
      // For now, just show mock product
      setCurrentProduct(MOCK_PRODUCT);
      setShowProduct(true);
    }
  }, [isProcessing, transcript, showProduct]);

  const handleMicClick = () => {
    // Prevent clicking during processing
    if (isProcessing) return;

    if (isRecording) {
      stopRecording();
    } else {
      // Clear product screen and start new recording
      if (showProduct) {
        setShowProduct(false);
        setCurrentProduct(null);
      }
      resetTranscript();
      startRecording();
    }
  };

  const handleAddToCart = () => {
    if (currentProduct) {
      addToCart(currentProduct);
      setShowProduct(false);
      setCurrentProduct(null);
      resetTranscript();
    }
  };

  // Show primary variant when processing, secondary when recording
  const variant = isRecording ? 'secondary' : 'primary';

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-50">
      {showProduct && currentProduct ? (
        /* Product Screen */
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full px-6 pb-32">
          {/* Voice Prompt */}
          <div className="absolute top-8 z-20">
            <VoicePrompt text="Do you want me to add it?" />
          </div>

          {/* Product Card */}
          <div className="mt-20">
            <ProductCard product={currentProduct} onAdd={handleAddToCart} />
          </div>

          {/* Mic Button */}
          <div className="absolute bottom-24">
            <VoiceButton
              icon={MicIcon}
              variant="primary"
              isRecording={false}
              isProcessing={false}
              onClick={handleMicClick}
            />
          </div>

          {/* Cart Summary */}
          {itemCount > 0 && (
            <CartSummary itemCount={itemCount} totalPrice={totalPrice} />
          )}
        </div>
      ) : (
        /* Voice Recording Screen */
        <div className="relative flex items-end justify-center min-h-screen pb-36">
          <div className="relative flex items-center justify-center">
            {/* Ellipse decoration that appears during recording */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  className="absolute"
                  style={{
                    width: '638px',
                    height: '538px',
                    borderRadius: '50%',
                    background: 'linear-gradient(180deg, #FFFFFF 23%, #ECE0FF 42%, #BEC8FF 58%)',
                    zIndex: 0,
                    bottom: '-256px',
                    filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.15))',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>

            {/* Transcription Display on top of ellipse */}
            {!showProduct && (
              <div className="absolute top-[-480px] z-10 w-full">
                <TranscriptionDisplay
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                  isRecording={isRecording}
                  error={error}
                />
              </div>
            )}

            {/* Voice Button */}
            <div className="relative z-10">
              <VoiceButton
                icon={MicIcon}
                variant={variant}
                isRecording={isRecording}
                isProcessing={isProcessing}
                onClick={handleMicClick}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}