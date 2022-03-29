import { memo } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ListItem, Typography } from '@mui/material';
import { Box } from '@mui/system';
import ImageSelector from 'components/common/CharmEditor/components/ImageSelector';
import { ImageSelectorGallery } from 'components/common/CharmEditor/components/ImageSelectorGallery';

const StyledPageBanner = styled(Box)<{focalBoard?: boolean}>`
  display: flex;
  align-items: center;
  height: 200px;
  justify-content: center;
  position: relative;
  width: 100%;

  img {
    width: 100%;
    object-fit: cover;
    height: 100%;
  }

  .page-cover-controls {
    visibility: hidden;
    position: absolute;
    bottom: 10px;
    right: ${({ focalBoard }) => focalBoard ? '10px' : '200px'};
  }

  &:hover .page-cover-controls {
    visibility: inherit;
  }
`;

export const PageCoverGalleryImageGroups = {
  'Color & Gradient': [
    '/images/patterns/notion/gradients_2.png',
    '/images/patterns/notion/gradients_3.png',
    '/images/patterns/notion/gradients_4.png',
    '/images/patterns/notion/gradients_5.png',
    '/images/patterns/notion/gradients_8.png',
    '/images/patterns/notion/gradients_10.jpg',
    '/images/patterns/notion/gradients_11.jpg',
    '/images/patterns/notion/solid_beige.png',
    '/images/patterns/notion/solid_blue.png',
    '/images/patterns/notion/solid_red.png',
    '/images/patterns/notion/solid_yellow.png'
  ]
};

interface PageBannerProps {
  focalBoard?: boolean;
  headerImage: string;
  setPage: (page: { headerImage: string | null }) => void;
}

function PageBanner ({ focalBoard, headerImage, setPage }: PageBannerProps) {

  const theme = useTheme();

  function setImage (_headerImage: string | null) {
    setPage({ headerImage: _headerImage });
  }

  return (
    <StyledPageBanner focalBoard={focalBoard}>
      {/* eslint-disable-next-line */}
      <img src={headerImage} alt='Page Banner' />
      <Box
        sx={{
          background: theme.palette.background.light,
          borderRadius: theme.spacing(0.5),
          display: 'flex',
          gap: theme.spacing(0.25),
          boxShadow: theme.shadows[2]
        }}
        className='page-cover-controls'
      >
        <ImageSelector
          tabs={[[
            'Gallery',
            <ImageSelectorGallery
              onImageClick={setImage}
              items={PageCoverGalleryImageGroups}
            />
          ]]}
          onImageSelect={setImage}
        >
          <ListItem
            button
            disableRipple
            sx={{
              background: theme.palette.background.dark,
              borderTopLeftRadius: theme.spacing(0.5),
              borderBottomLeftRadius: theme.spacing(0.5),
              padding: theme.spacing(0.5, 1.5)
            }}
          >
            <Typography variant='subtitle1' whiteSpace='nowrap'>
              Change Cover
            </Typography>
          </ListItem>
        </ImageSelector>
        <ListItem
          button
          disableRipple
          sx={{
            background: theme.palette.background.dark,
            borderTopRightRadius: theme.spacing(0.5),
            borderBottomRightRadius: theme.spacing(0.5),
            padding: theme.spacing(0.5, 1.5)
          }}
        >
          <Typography
            variant='subtitle1'
            onClick={() => setImage(null)}
          >
            Remove
          </Typography>
        </ListItem>
      </Box>
    </StyledPageBanner>
  );
}

export default memo(PageBanner);