interface BlinkingCircleProps {
  color?: string;
  size?: string;
  speed?: string;
}

const BlinkingCircle = ({ color = 'red', size = '20px', speed = '1s' }: BlinkingCircleProps) => {
  const circleStyle = {
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: '50%',
    display: 'inline-block',
    animation: `blink ${speed} infinite ease-in-out`
  };

  return <div style={circleStyle} />;
};

export default BlinkingCircle;