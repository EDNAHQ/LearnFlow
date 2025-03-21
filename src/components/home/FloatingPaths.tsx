
import { motion } from "framer-motion";

function FloatingPaths({ position }: { position: number }) {
    // Generate more paths for a denser effect
    const paths = Array.from({ length: 45 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: i % 2 === 0 ? `rgba(109, 66, 239, ${0.2 + i * 0.02})` : `rgba(232, 67, 147, ${0.2 + i * 0.02})`, // Alternating brand colors
        width: 0.8 + i * 0.04, // Slightly thicker lines
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full"
                viewBox="0 0 696 316"
                fill="none"
                preserveAspectRatio="xMidYMid slice" // This helps maintain the aspect ratio while filling the viewport
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.2 + path.id * 0.02}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.4, 0.8, 0.4], // More pronounced opacity animation
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 15 + Math.random() * 10, // Slightly faster animation
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                            delay: path.id * 0.1, // Staggered animation start
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
