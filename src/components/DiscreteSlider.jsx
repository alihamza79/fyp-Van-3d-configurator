// components/DiscreteSlider.jsx
import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { motion } from 'framer-motion';

function valuetext(value) {
  return `${value}°`;
}

const MotionBox = motion(Box);

const DiscreteSlider = ({ value, onChange, ...props }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      sx={{ width: 200 }} // Adjust width as needed
    >
      <Slider
        aria-label="Rotation Angle"
        value={value}
        onChange={onChange}
        getAriaValueText={valuetext}
        valueLabelDisplay="auto"
        step={1}
        marks={[
          { value: -180, label: '-180°' },
          { value: -90, label: '-90°' },
          { value: 0, label: '0°' },
          { value: 90, label: '90°' },
          { value: 180, label: '180°' },
        ]}
        min={-180}
        max={180}
        sx={{
          color: 'black',
          '& .MuiSlider-thumb': {
            backgroundColor: 'black',
            transition: 'all 0.2s ease-in-out',
          },
          '& .MuiSlider-track': {
            backgroundColor: 'black',
            transition: 'width 0.2s ease-in-out',
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#666',
          },
          '& .MuiSlider-mark': {
            backgroundColor: 'black',
          },
          '& .MuiSlider-markLabel': {
            color: 'black',
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          '& .MuiSlider-valueLabel': {
            backgroundColor: 'black',
            transition: 'transform 0.2s ease-in-out',
          }
        }}
        {...props}
      />
    </MotionBox>
  );
};

export default DiscreteSlider;
