import React from 'react';
import {Pressable, type PressableProps} from 'react-native';

type PressableOpacityProps = PressableProps & {
  activeOpacity?: number;
};

const PressableOpacity: React.FC<PressableOpacityProps> = ({
  activeOpacity = 0.2,
  disabled,
  style,
  ...props
}) => (
  <Pressable
    {...props}
    disabled={disabled}
    style={state => [
      typeof style === 'function' ? style(state) : style,
      state.pressed && !disabled ? {opacity: activeOpacity} : null,
    ]}
  />
);

export default PressableOpacity;
