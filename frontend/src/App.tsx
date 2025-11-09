import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import VoiceButton from './components/VoiceButton';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import ProductCard from './components/ProductCard';
import VoicePrompt from './components/VoicePrompt';
import CartSummary from './components/CartSummary';
import CartPage from './components/CartPage';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useCartStore, useCartItemCount } from './stores/cartStore';
import { fetchProductRecommendations } from './services/api';
import type { Product } from './types/product';
import MicIcon from './assets/mic.svg';

type ViewType = 'voice' | 'product' | 'cart';

export default function App() {
  const {
    isRecording,
    isProcessing,
    transcript,
    interimTranscript,
    error,
    detectedCommand,
    startRecording,
    stopRecording,
    resetTranscript,
    clearCommand,
    setProcessing,
  } = useVoiceRecorder();

  const itemCount = useCartItemCount();
  const { addToCart } = useCartStore();
  const [currentView, setCurrentView] = useState<ViewType>('voice');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // When recording stops with transcript, fetch product from API
  useEffect(() => {
    if (!isRecording && transcript && currentView === 'voice' && !isProcessing) {
      const fetchProduct = async () => {
        try {
          console.log('[App] Fetching product for transcript:', transcript);
          setProcessing(true);
          setApiError(null);

          const product = await fetchProductRecommendations(transcript);

          if (product) {
            setCurrentProduct(product);
            setCurrentView('product');

            // Clear old transcript before starting new recording
            resetTranscript();

            // Auto-start recording to listen for voice commands
            setTimeout(() => {
              startRecording();
            }, 500);
          } else {
            setApiError('No products found for your request');
            resetTranscript();
          }
        } catch (err) {
          console.error('[App] Error fetching product:', err);
          setApiError('Failed to fetch products. Please try again.');
          resetTranscript();
        } finally {
          setProcessing(false);
        }
      };

      fetchProduct();
    }
  }, [isRecording, transcript, currentView]);

  // Handle voice commands
  useEffect(() => {
    if (!detectedCommand) return;

    if (detectedCommand === 'add' && currentProduct) {
      console.log('[App] Add command detected, stopping recording');
      // Stop recording and clear transcript immediately
      stopRecording();
      resetTranscript();

      // Show confirmation animation
      setShowConfirmation(true);

      // After brief animation (500ms), add to cart and restart recording
      setTimeout(() => {
        console.log('[App] Confirmation complete, adding to cart');
        handleAddToCart();
        setShowConfirmation(false);

        // Restart recording after brief delay
        setTimeout(() => {
          console.log('[App] Attempting to restart recording');
          startRecording();
        }, 300);
      }, 500);
    } else if (detectedCommand === 'cart') {
      // Navigate to cart page when "장바구니" is spoken
      setCurrentView('cart');
    }

    clearCommand();
  }, [detectedCommand, currentProduct]);

  const handleMicClick = () => {
    // Prevent clicking during processing
    if (isProcessing) return;

    if (isRecording) {
      stopRecording();
    } else {
      // Clear product screen and start new recording
      if (currentView !== 'voice') {
        setCurrentView('voice');
        setCurrentProduct(null);
      }
      resetTranscript();
      startRecording();
    }
  };

  const handleAddToCart = () => {
    if (currentProduct) {
      addToCart(currentProduct);
      setCurrentView('product');
      // Keep the product visible, don't clear it
    }
  };

  const handleCartClick = () => {
    setCurrentView('cart');
  };

  const handleBackFromCart = () => {
    setCurrentView('voice');
  };

  // Show primary variant when processing, secondary when recording
  const variant = isRecording ? 'secondary' : 'primary';

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-50">
      {/* Cart Page */}
      <AnimatePresence>
        {currentView === 'cart' && (
          <CartPage onBack={handleBackFromCart} />
        )}
      </AnimatePresence>

      {currentView === 'product' && currentProduct ? (
        /* Product Screen */
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full px-6 pb-32">
          {/* Voice Prompt */}
          <div className="absolute top-8 z-20">
            <VoicePrompt text="Do you want me to add it?" />
          </div>

          {/* Product Card */}
          <div className="mt-20 relative">
            {/* Product Card with conditional opacity */}
            <motion.div
              animate={{
                opacity: transcript.trim() || interimTranscript.trim() ? 0.4 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={currentProduct} onAdd={handleAddToCart} />
            </motion.div>

            {/* Transcript Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <TranscriptionDisplay
                transcript={transcript}
                interimTranscript={interimTranscript}
                isRecording={isRecording}
                error={error}
              />
            </div>

            {/* Confirmation Animation Overlay */}
            <AnimatePresence>
              {showConfirmation && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-3xl z-30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.4 }}
                  >
                    <svg
                      className="w-16 h-16 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mic Button */}
          <div className="absolute bottom-24">
            <VoiceButton
              icon={MicIcon}
              variant="secondary"
              isRecording={isRecording}
              isProcessing={isProcessing}
              onClick={handleMicClick}
            />
          </div>

          {/* Cart Summary */}
          {itemCount > 0 && (
            <CartSummary onClick={handleCartClick} />
          )}
        </div>
      ) : currentView === 'voice' ? (
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
            <div className="absolute top-[-480px] z-10 w-full">
              <TranscriptionDisplay
                transcript={transcript}
                interimTranscript={interimTranscript}
                isRecording={isRecording}
                error={error || apiError}
              />
            </div>

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

          {/* Cart Summary */}
          {itemCount > 0 && (
            <CartSummary onClick={handleCartClick} />
          )}
        </div>
      ) : null}
    </div>
  );
}
