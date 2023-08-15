/* eslint-disable quotes */
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { routePath } from '@/routes/routePath';
import { useEffect } from 'react';
import Svg404 from '@/assets/images/not-found/404.svg';
import MeteorSvg from '@/assets/images/not-found/meteor.svg';
import SpaceshipSvg from '@/assets/images/not-found/spaceship.svg';
import AstronautSvg from '@/assets/images/not-found/astronaut.svg';

const MuiContainer = styled(Container)`
  background-image: url('/icons/star.svg'), linear-gradient(to bottom, #05007a, #4d007d);
  height: 100vh;
  margin: 0;
  background-attachment: fixed;
  overflow: hidden;
`;

const MarsBox = styled(Box)`
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  height: 27vmin;
  background: url('/icons/mars.svg') no-repeat bottom center;
  background-size: cover;
`;

const Logo404 = styled(Box)`
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  top: 24vmin;
  width: fit-content;

  @include breakpoint(mobile) {
    top: 45vmin;
  }
`;

const MeteorImg = styled(Box)`
  position: absolute;
  right: 2vmin;
  top: 16vmin;
`;

const Title = styled('p')`
  color: white;
  font-weight: 600;
  text-align: center;
  font-size: 4.5vmin;
  margin-top: 34vmin;

  @include breakpoint(mobile) {
    margin-top: 65vmin;
  }
`;

const SubTitle = styled('p')`
  color: white;
  font-weight: 400;
  text-align: center;
  font-size: 3vmin;
  margin-top: -2vmin;
  margin-bottom: 4vmin;
`;

const BackButton = styled('a')`
  border: 1px solid white;
  color: white;
  height: 5vmin;
  padding: 12px;
  text-decoration: none;
  border-radius: 5px;

  &:hover {
    background: white;
    color: #4d007d;
  }

  @include breakpoint(mobile) {
    font-size: 3.5vmin;
  }
`;

const AstronautImg = styled(Box)`
  position: absolute;
  top: 18vmin;
  left: 10vmin;
  height: 30vmin;
  animation: floating 3s infinite ease-in-out;

  @keyframes floating {
    from {
      transform: translateY(0px);
    }
    65% {
      transform: translateY(15px);
    }
    to {
      transform: translateY(-0px);
    }
  }

  @include breakpoint(mobile) {
    top: 2vmin;
  }
`;

const SpaceshipImg = styled(Box)`
  position: absolute;
  bottom: 15vmin;
  right: 24vmin;

  @include breakpoint(mobile) {
    width: 45vmin;
    bottom: 18vmin;
  }
`;

function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname !== routePath.NOT_FOUND) {
      navigate(routePath.NOT_FOUND);
    }
  }, []);

  return (
    <MuiContainer maxWidth={false}>
      <MarsBox />
      <Logo404>
        <Svg404 />
      </Logo404>

      <MeteorImg>
        <MeteorSvg />
      </MeteorImg>
      <Title>{`${window.T('Oh no')}`}!!</Title>
      <SubTitle>
        {window.T('You’re either misspelling the URL')}
        <br />
        {window.T("or requesting a page that's no longer here.")}
      </SubTitle>
      <Box
        sx={{
          textAlign: 'center',
        }}
      >
        <BackButton href={routePath.HOME}>{window.T('Back to Home')}</BackButton>
      </Box>
      <AstronautImg>
        <AstronautSvg />
      </AstronautImg>
      <SpaceshipImg>
        <SpaceshipSvg />
      </SpaceshipImg>
    </MuiContainer>
  );
}

export default NotFound;
