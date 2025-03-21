
import { motion } from "framer-motion";

function FloatingPaths({ position }: { position: number }) {
    // Generate paths with subtle, thinner lines as originally designed
    const paths = Array.from({ length: 35 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: i % 2 === 0 ? `rgba(109, 66, 239, ${0.4})` : `rgba(232, 67, 147, ${0.4})`, // Using brand colors with consistent opacity
        width: 0.8 + i * 0.02, // Thinner lines as originally preferred
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full"
                viewBox="0 0 696 316"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke={path.color}
                        strokeWidth={path.width}
                        strokeOpacity={0.6} // Consistent opacity for better visibility
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.4, 0.7, 0.4], // Subtle opacity animation
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                            delay: path.id * 0.1,
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function AnimatedBackgroundPaths() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <div className="text-brand-purple">
                <FloatingPaths position={1} />
            </div>
            <div className="text-brand-pink">
                <FloatingPaths position={-1} />
            </div>
        </div>
    );
}

export default AnimatedBackgroundPaths;
