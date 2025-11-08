import VoiceButton from './components/VoiceButton';
import MicIcon from './assets/mic.svg';

export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <VoiceButton icon={MicIcon} variant="secondary" />
    </div>
  )
}