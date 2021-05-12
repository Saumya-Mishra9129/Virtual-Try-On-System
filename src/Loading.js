import React from "react";
import styled from "styled-components";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import PacmanLoader from "react-spinners/PacmanLoader";
import ClockLoader from "react-spinners/ClockLoader";
import HashLoader from "react-spinners/HashLoader";
import GridLoader from "react-spinners/GridLoader";
import RingLoader from "react-spinners/RingLoader";
import { Backdrop } from "@material-ui/core";

const loaders = [
  ClimbingBoxLoader,
  ClimbingBoxLoader,
  PacmanLoader,
  PacmanLoader,
  ClockLoader,
  HashLoader,
  GridLoader,
  RingLoader,
];

const Wrapper = styled.div`
  flex-direction: column;
  font-size: 20px;
  > * {
    margin: 1rem;
  }
`;
const StyledBackdrop = styled(Backdrop)`
  flex-direction: column;
  font-size: 20px;
  > * {
    margin: 0.5rem;
  }
  &.MuiBackdrop-root {
    z-index: 1301;
  }
`;

export default function Loading({
  backdrop = true,
  showText = true,
  random = true,
  loading,
  // size = 15,
  // margin = 2,
  color = "#21cbf3",
  ...props
}) {
  if (!loading) return null;

  const LoaderComponent = random
    ? loaders[Math.floor(Math.random() * loaders.length)]
    : ClimbingBoxLoader;

  return backdrop ? (
    <Wrapper className="loading" {...props}>
      <StyledBackdrop open={loading} style={{ color }}>
        <LoaderComponent
          loading={loading}
          // size={size}
          // margin={margin}
          color={color}
        />
        <div>Loading...Please Wait</div>
      </StyledBackdrop>
    </Wrapper>
  ) : (
    <Wrapper className="loading" {...props} style={{ color }}>
      <LoaderComponent
        {...props}
        loading={loading}
        // size={size}
        // margin={margin}
        color={color}
      />
      {showText && <div>Loading...Please Wait</div>}
    </Wrapper>
  );
}
