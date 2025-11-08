interface VoiceButtonProps {
    icon: string;
}

export default function VoiceButton({ icon }: VoiceButtonProps) {
    return (
        <button className="relative inline-flex items-center justify-center">
            {/* Outer ellipse - 78x78 */}
            <div
                className="absolute"
                style={{
                    width: '78px',
                    height: '78px',
                    borderRadius: '50%',
                    background: 'linear-gradient(180deg, #E6F1FF 63%, #ABCEFF 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
            />

            {/* Inner ellipse stroke wrapper - 62x62 */}
            <div
                className="absolute flex items-center justify-center"
                style={{
                    width: '62px',
                    height: '62px',
                    borderRadius: '50%',
                    background: 'linear-gradient(180deg, #546EFF 0%, #091971 100%)',
                    padding: '1px',
                }}
            >
                {/* Inner ellipse fill - 60x60 */}
                <div
                    className="flex items-center justify-center"
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: '#3856FC',
                    }}
                >
                    {/* Icon in center */}
                    <img src={icon} alt="Microphone" className="w-[18px] h-[18px]" />
                </div>
            </div>
        </button >
    );
}
