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
    isListening,
    isProcessing,
    transcript,
    interimTranscript,
    error,
    detectedCommand,
    startListening,
    stopListening,
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
  const [isProductAdded, setIsProductAdded] = useState(false);

  // When listening stops with transcript, fetch product from API
  useEffect(() => {
    if (!isListening && transcript && !isProcessing && !detectedCommand) {
      const fetchProduct = async () => {
        try {
          console.log('[App] Fetching product for transcript:', transcript);
          setProcessing(true);
          setApiError(null);

          const product = await fetchProductRecommendations(transcript);

          if (product) {
            setCurrentProduct(product);
            setCurrentView('product');
            setIsProductAdded(false); // Reset for new product
            resetTranscript();

            // Auto-start listening for voice commands
            setTimeout(() => {
              startListening();
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
  }, [isListening, transcript, isProcessing, detectedCommand]);

  // Handle voice commands
  useEffect(() => {
    if (!detectedCommand) return;

    if (detectedCommand === 'add' && currentProduct) {
      console.log('[App] Add command detected, stopping listening');
      stopListening();
      resetTranscript();

      setShowConfirmation(true);

      setTimeout(() => {
        console.log('[App] Confirmation complete, adding to cart');
        handleAddToCart();
        setShowConfirmation(false);

        // Restart listening after brief delay
        setTimeout(() => {
          console.log('[App] Attempting to restart listening');
          startListening();
        }, 300);
      }, 500);
    } else if (detectedCommand === 'cart') {
      setCurrentView('cart');
    }

    clearCommand();
  }, [detectedCommand, currentProduct]);

  const handleMicClick = () => {
    if (isProcessing) return;

    if (isListening) {
      stopListening();
    } else {
      // If we are on the product view and the item has been added,
      // clicking the mic should start a new search.
      if (currentView === 'product' && isProductAdded) {
        setCurrentView('voice');
        setCurrentProduct(null);
        setIsProductAdded(false);
      } else if (currentView !== 'voice') {
        setCurrentView('voice');
        setCurrentProduct(null);
      }
      resetTranscript();
      startListening();
    }
  };

  const handleAddToCart = () => {
    if (currentProduct) {
      addToCart(currentProduct);
      setIsProductAdded(true);
    }
  };

  const handleCartClick = () => {
    setCurrentView('cart');
  };

  const handleBackFromCart = () => {
    // If returning from cart to a product view where item was added,
    // go back to main voice screen instead.
    if (currentView === 'product' && isProductAdded) {
      setCurrentView('voice');
    } else {
      setCurrentView('voice');
    }
  };

  const variant = isListening ? 'secondary' : 'primary';

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-50">
      <AnimatePresence>
        {currentView === 'cart' && (
          <CartPage onBack={handleBackFromCart} />
        )}
      </AnimatePresence>

      {currentView === 'product' && currentProduct ? (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full px-6 pb-32">
          {!isProductAdded && (
            <div className="absolute top-8 z-20">
              <VoicePrompt text="Do you want me to add it?" />
            </div>
          )}

          <div className="mt-20 relative">
            <motion.div
              animate={{
                opacity: transcript.trim() || interimTranscript.trim() || isProductAdded ? 0.4 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={currentProduct} onAdd={handleAddToCart} />
            </motion.div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <TranscriptionDisplay
                transcript={transcript}
                interimTranscript={interimTranscript}
                isRecording={isListening}
                error={error}
              />
            </div>

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

          <div className="absolute bottom-24">
            <VoiceButton
              icon={MicIcon}
              variant="secondary"
              isRecording={isListening}
              isProcessing={isProcessing}
              onClick={handleMicClick}
            />
          </div>

          {itemCount > 0 && (
            <CartSummary onClick={handleCartClick} />
          )}
        </div>
      ) : currentView === 'voice' ? (
        <div className="relative flex items-end justify-center min-h-screen pb-36">
          <div className="relative flex items-center justify-center">
            <AnimatePresence>
              {isListening && (
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

            <div className="absolute top-[-480px] z-10 w-full">
              <TranscriptionDisplay
                transcript={transcript}
                interimTranscript={interimTranscript}
                isRecording={isListening}
                error={error || apiError}
              />
            </div>

            <div className="relative z-10">
              <VoiceButton
                icon={MicIcon}
                variant={variant}
                isRecording={isListening}
                isProcessing={isProcessing}
                onClick={handleMicClick}
              />
            </div>
          </div>

          {itemCount > 0 && (
            <CartSummary onClick={handleCartClick} />
          )}
        </div>
      ) : null}
    </div>
  );
}
