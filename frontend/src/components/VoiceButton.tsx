import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const voiceButtonVariants = cva(
    'relative inline-flex items-center justify-center',
    {
        variants: {
            variant: {
                primary: '',
                secondary: '',
            },
        },
        defaultVariants: {
            variant: 'primary',
        },
    }
);

interface VoiceButtonProps
    extends React.ComponentProps<'button'>,
    VariantProps<typeof voiceButtonVariants> {
    icon: string;
}

export default function VoiceButton({
    icon,
    variant,
    className,
    ...props
}: VoiceButtonProps) {
    const isPrimary = variant === 'primary';

    return (
        <button className={voiceButtonVariants({ variant, className })} {...props}>
            {isPrimary ? (
                <>
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
                </>
            ) : (
                /* Secondary variant - Single ellipse with stroke - 62x62 */
                <div
                    className="absolute flex items-center justify-center"
                    style={{
                        width: '62px',
                        height: '62px',
                        borderRadius: '50%',
                        background: '#B8C3FF',
                        padding: '1px',
                    }}
                >
                    {/* White fill - 60x60 */}
                    <div
                        className="flex items-center justify-center"
                        style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {/* Icon in center with blue color */}
                        <img
                            src={icon}
                            alt="Icon"
                            className="w-[18px] h-[18px]"
                            style={{
                                filter: 'brightness(0) saturate(100%) invert(35%) sepia(89%) saturate(2893%) hue-rotate(226deg) brightness(102%) contrast(98%)',
                            }}
                        />
                    </div>
                </div>
            )}
        </button>
    );
}

export { voiceButtonVariants };
