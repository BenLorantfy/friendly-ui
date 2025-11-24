import React from 'react';
import { getPathForInaccessibleBackgroundColors, getPathForInaccessibleForegroundColors } from './utils';
import { ColorArea } from '../react-aria-components/ColorArea';
import { ColorSlider } from '../react-aria-components/ColorSlider';
import { ColorField } from '../react-aria-components/ColorField';
import { parseColor } from 'react-aria-components';
import { ColorPicker } from '../react-aria-components/ColorPicker';
import Color from 'color';
import { rgb } from 'wcag-contrast';

function calculateSelectionColor(cursorColor: Parameters<typeof Color>[0]) {
    const color = Color(cursorColor);

    return Color({
        h: color.hsl().hue(),
        s: color.hsl().saturationl(),
        l: Math.min(color.hsl().lightness() * 5, 90)
    }).toString();
}

interface StoryProps {
  requiredContrastRatio?: number;
}

const Story: React.FC<StoryProps> = ({ requiredContrastRatio = 4.5 }) => {
  const [cursorColor, setCursorColor] = React.useState(parseColor('hsl(25, 100%, 25%)'));
  const hue = cursorColor.getChannelValue("hue");
  const inaccessibleCursorColorsPath = React.useMemo(
    () => getPathForInaccessibleForegroundColors({ hue, backgroundColor: [255, 255, 255], requiredContrastRatio }),
    [hue, requiredContrastRatio]
  );
  const inaccessibleSelectionColorsPath = React.useMemo(
    () => getPathForInaccessibleBackgroundColors({ hue, foregroundColor: [0,0,0], requiredContrastRatio, transformColor: calculateSelectionColor }),
    [hue, requiredContrastRatio]
  );
  const selectionColor = calculateSelectionColor(cursorColor.toString());

  const cursorColorColor = Color(cursorColor.toString()).rgb();
  const selectionColorColor = Color(selectionColor).rgb();

  const cursorContrastWithWhiteBackground = rgb([cursorColorColor.red(), cursorColorColor.green(), cursorColorColor.blue()], [255,255,255]);
  const textContrastWithSelectionColor = rgb([0,0,0], [selectionColorColor.red(), selectionColorColor.green(), selectionColorColor.blue()]);

  const hasEnoughContrast = cursorContrastWithWhiteBackground > requiredContrastRatio && textContrastWithSelectionColor > requiredContrastRatio;

  return (
    <ColorPicker value={cursorColor} onChange={setCursorColor}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', width: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '192px', position: 'relative' }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              style={{
                display: "block",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            >
              <defs>
                <pattern
                  id="diagonalStripes"
                  patternUnits="userSpaceOnUse"
                  width="10"
                  height="10"
                  patternTransform="rotate(45)"
                >
                  <rect
                    x="0"
                    y="0"
                    width="5"
                    height="10"
                    fill={hasEnoughContrast ? "white" : "#E51010"}
                    fillOpacity={hasEnoughContrast ? 0.35 : 0.5}
                    style={{
                      transition: "fill 0.3s, fill-opacity 0.3s"
                    }}
                  />
                </pattern>
              </defs>
              <g transform="translate(0,0)">
                <path 
                  d={inaccessibleCursorColorsPath} 
                  fill="url(#diagonalStripes)" 
                  stroke={hasEnoughContrast ? "rgba(210,210,210)" : "#E51010"} 
                  strokeWidth={2}
                  style={{
                    transition: "stroke 0.3s"
                  }}
                />
                <path 
                  d={inaccessibleSelectionColorsPath} 
                  fill="url(#diagonalStripes)" 
                  stroke={hasEnoughContrast ? "rgba(210,210,210)" : "#E51010"} 
                  strokeWidth={2} 
                  style={{
                    transition: "stroke 0.3s"
                  }}
                />
              </g>
            </svg>
            <ColorArea
              colorSpace="hsl"
              xChannel="saturation"
              yChannel="lightness"
              value={cursorColor}
              onChange={setCursorColor}
            />
          </div>
          <ColorSlider colorSpace="hsb" channel="hue" />
          <ColorField label="Hex" value={cursorColor} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ marginTop: 0, marginBottom: 0}}>
            Preview
          </h2>
          <div>
            <span
              style={{
                backgroundColor: selectionColor,
                borderRight: `4px solid ${cursorColor.toString()}`,
                fontSize: '24px',
                padding: '1px',
                paddingRight: '3px',
                display: 'inline-block',
                position: 'relative',
                userSelect: 'none',
              }}
            >
              abc def ghi
              <span
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-7px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: cursorColor.toString(),
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  display: 'block',
                }}
              />
            </span>
          </div>
          {/* TODO: make this text fade-in */}
          {!hasEnoughContrast && (
            <div style={{
              color: '#E51010',
              fontSize: '20px'
            }}>
              { cursorContrastWithWhiteBackground < requiredContrastRatio ?
            (
              <>
                Color is too light!<br /><br />
                It may be hard to see the cursor.  Please select a darker color.
              </>
            ) : (
              <>
                Color is too dark!<br /><br />
                It may be hard to see the text.  Please select a lighter color.
              </>
            )  
            }
            </div>
          )}
        </div>
      </div>
    </ColorPicker>
  );
};

export default {
  title: 'utils',
  component: Story,
  argTypes: {
    requiredContrastRatio: {
      control: { type: 'number', min: 1, max: 21, step: 0.1 },
      defaultValue: 4.5,
      description: 'The required contrast ratio for accessibility lines'
    }
  }
};

export const Default = {
  render: (args: StoryProps) => <Story {...args} />,
  args: {
    requiredContrastRatio: 4.5,
  },
};
