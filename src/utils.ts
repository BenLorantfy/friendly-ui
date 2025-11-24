import { rgb } from 'wcag-contrast';
import Color from 'color';

type ColorInput = Parameters<typeof Color>[0];

export function getPathForInaccessibleForegroundColors({ 
    hue, 
    backgroundColor,
    requiredContrastRatio = 4.5
}: { 
    hue: number, 
    backgroundColor: [r: number, g: number, b: number],
    requiredContrastRatio: number
}) {
    if (backgroundColor[0] !== 255 || backgroundColor[1] !== 255 || backgroundColor[2] !== 255) {
        throw new Error('Currently only white background is supported.');
    }

    const points: Array<{ x: number, y: number }> = [];
    for (let saturation = 0; saturation <= 100; saturation++) {
        points.push({
            x: saturation,
            y: 100 - findFirstForegroundLightnessThatIsInaccessible({ hue, saturation, backgroundColor, requiredContrastRatio }),
        });
    }
    return `M0 0 ${points.map(point => `${point.x} ${point.y}`).join(' ')} 100 0 Z`;
}

export function getPathForInaccessibleBackgroundColors({ hue, foregroundColor, requiredContrastRatio = 4.5, transformColor }: { hue: number, foregroundColor: [r: number, g: number, b: number], requiredContrastRatio: number, transformColor?: (color: ColorInput) => string }) {
    if (foregroundColor[0] !== 0 || foregroundColor[1] !== 0 || foregroundColor[2] !== 0) {
        throw new Error('Currently only black foreground is supported.');
    }

    const points: Array<{ x: number, y: number }> = [];
    for (let saturation = 0; saturation < 100; saturation++) {
        const args: Parameters<typeof findFirstBackgroundLightnessThatIsInaccessible>[0] = {
            hue,
            saturation,
            foregroundColor,
            requiredContrastRatio,
            ...(transformColor && { transformColor }),
        };
        points.push({
            x: saturation,
            y: 100 - findFirstBackgroundLightnessThatIsInaccessible(args),
        });
    }

    return `M0 100 ${points.map(point => `${point.x} ${point.y}`).join(' ')} 100 100 Z`;
}

function findFirstForegroundLightnessThatIsInaccessible({ hue, saturation, backgroundColor, requiredContrastRatio }: { hue: number, saturation: number, backgroundColor: [r: number, g: number, b: number], requiredContrastRatio: number }) {
    // TODO: figure out if we should start at 0 or 100
    for (let lightness = 0; lightness <= 100; lightness++) {
        const color = Color({ h: hue, s: saturation, l: lightness });
        const contrast = rgb([color.red(), color.green(), color.blue()], backgroundColor);
        const isInaccessible = contrast < requiredContrastRatio;
        
        if (isInaccessible) {
            return lightness;
        }
    }
    return 100;
}

function findFirstBackgroundLightnessThatIsInaccessible({ hue, saturation, foregroundColor, requiredContrastRatio, transformColor }: { hue: number, saturation: number, foregroundColor: [r: number, g: number, b: number], requiredContrastRatio: number, transformColor?: (color: ColorInput) => string }) {
    // TODO: figure out if we should start at 0 or 100
    for (let lightness = 100; lightness > 0; lightness--) {
        const baseColor = { h: hue, s: saturation, l: lightness };
        const transformedColor = transformColor ? transformColor(baseColor) : Color(baseColor).toString();
        const color = Color(transformedColor).rgb();
        const contrast = rgb(foregroundColor, [color.red(), color.green(), color.blue()])
        const isInaccessible = contrast < requiredContrastRatio;
        if (isInaccessible) {
            return lightness;
        }
    }
    return 100;
}