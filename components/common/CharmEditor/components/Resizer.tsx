import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { ResizableBox, ResizableProps } from 'react-resizable';

interface ResizerProps {
  width?: number
  height?: number
  size?: number
  maxSize?: number
  minSize?: number
  children: ReactNode
  onResize?: ResizableProps['onResize']
  minConstraints?: ResizableProps['minConstraints']
  maxConstraints?: ResizableProps['maxConstraints']
  onResizeStop?: ResizableProps['onResizeStop']
}

export const StyledResizeHandle = styled(Box)`
  width: 7.5px;
  height: calc(100% - 25px);
  max-height: 75px;
  border-radius: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.palette.background.dark};
  opacity: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: opacity 250ms ease-in-out;
  cursor: col-resize;

  &.react-resizable-handle-w {
    left: 15px;
  }

  &.react-resizable-handle-e {
    right: 15px;
  }
`;

export default function Resizer (props: ResizerProps) {
  const { width, height, size = 250, onResizeStop, onResize, minConstraints,
    maxConstraints, minSize = 250, maxSize = 750, children } = props;

  return (
    <Box
      sx={{
        '&:hover .react-resizable-handle': {
          opacity: 1,
          transition: 'opacity 250ms ease-in-out'
        },
        '& .react-resizable': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }}
    >
      <ResizableBox
        onResize={onResize}
        width={width ?? maxConstraints?.[0] ?? size ?? maxSize}
        height={height ?? maxConstraints?.[1] ?? size ?? maxSize}
        resizeHandles={['w', 'e']}
        lockAspectRatio
        minConstraints={minConstraints ?? [minSize, minSize]}
        maxConstraints={maxConstraints ?? [maxSize, maxSize]}
        onResizeStop={onResizeStop}
        /* eslint-disable-next-line */
        handle={(handleAxis: string, ref: React.Ref<unknown>) => <StyledResizeHandle ref={ref} className={`react-resizable-handle react-resizable-handle-${handleAxis}`} />}
      >
        {children}
      </ResizableBox>
    </Box>
  );
}