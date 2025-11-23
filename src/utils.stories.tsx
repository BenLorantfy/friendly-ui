import React from 'react';
import { getPathForInaccessibleColors } from './utils';
import { ColorArea } from './react-aria-components/ColorArea';
import { ColorThumb } from './react-aria-components/ColorThumb';
import { ColorSlider } from './react-aria-components/ColorSlider';
import { ColorField } from './react-aria-components/ColorField';
import { parseColor } from 'react-aria-components';
import { ColorPicker } from './react-aria-components/ColorPicker';

const ExampleSVG = () => {
  let [value, setValue] = React.useState(parseColor('hsl(25, 100%, 50%)'));
  const pathD = getPathForInaccessibleColors({ hue: 210, backgroundColor: '#ffffff' });
  const hue = value.getChannelValue("hue");

  console.log(hue);
  return (
    <div>
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
          <g transform="translate(0,0)">
            <path d={pathD} fill="rgba(200, 0, 0, 0.2)" />
          </g>
        </svg>
        <ColorArea
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
          value={value}
          onChange={setValue}
        />
      </div>
      <ColorSlider colorSpace="hsb" channel="hue" value={value} onChange={setValue} />
      <ColorField label="Hex" value={value} />
    </div>
  );
};

const meta = {
  title: 'Utils/getPathForInaccessibleColors',
  component: ExampleSVG,
};

export default meta;

export const Default = {
  render: () => <ExampleSVG />,
};
