function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeIn(t: number): number {
    return 2 * t * t;
}

type Bezier = (t: number) => number;

function bezier(
    cx1: number,
    cy1: number,
    cx2: number,
    cy2: number,
    eps = 1e-6
): Bezier {
    // Полиномы x(u) и y(u) в виде (((a u + b) u + c) u)
    const cx = 3 * cx1,
        bx = 3 * (cx2 - cx1) - cx,
        ax = 1 - cx - bx;

    const cy = 3 * cy1,
        by = 3 * (cy2 - cy1) - cy,
        ay = 1 - cy - by;

    return (x: number): number => {
        // Ньютон для поиска u, где x(u) ≈ x
        let u = x;                       // стартовое приближение
        for (let i = 0; i < 8; i++) {
            const dx = ((ax * u + bx) * u + cx) * u - x;
            const d  = (3 * ax * u + 2 * bx) * u + cx;
            if (Math.abs(dx) < eps || Math.abs(d) < 1e-6) break;
            u -= dx / d;
        }

        u = u < 0 ? 0 : u > 1 ? 1 : u;   // clamp(0, 1)
        return ((ay * u + by) * u + cy) * u;
    };
}

export const ease = bezier(0.25, 0.1, 0.25, 1);

export const animationIds: Record<string, string> = {};

export function animate(
    callback: (...values: number[]) => void, // [currentValue1, currentValue2, ...]
    time: number, // ms
    animationId: string, // to prevent parallel animations width same Ids
    ...values: number[] // startValue1, endValue1, startValue2, endValue2, ...
): Promise<string> {
    const id = genId();
    animationIds[animationId] = id;
    const startTime = Date.now();
    const numPairs = values.length / 2;
    const currentValues: number[] = [];
    return new Promise((resolve) => {
        const updateAnimation = () => {
            if (animationIds[animationId] !== id) {
                resolve(id);
                return;
            }
            const currentTime = Date.now();
            const deltaTime = currentTime - startTime;

            if (deltaTime >= time) {
                for (let i = 1, len = values.length; i < len; i += 2) {
                    currentValues.push(values[i]);
                }
                callback(...currentValues);
                animationIds[animationId] === id && (delete animationIds[animationId]);
                resolve(id);
            } else {
                const t = deltaTime / time;
                const easedT = ease(t);
                for (let i = 0; i < numPairs; i++) {
                    const start = values[i * 2];
                    const currentValue = start + (values[i * 2 + 1] - start) * easedT;
                    currentValues.push(currentValue);
                }
                callback(...currentValues);
                currentValues.length = 0;
                requestAnimationFrame(updateAnimation);
            }
        }

        updateAnimation();
    });
}


export function getPercentageDifference(value1: number, value2: number): number {
    return value1 ? ((value2 - value1) / value1) * 100 : 0;
}

export function toSigned16(val: number): number {
    val &= 0xFFFF;
    return val >= 0x8000 ? val - 0x10000 : val;
}