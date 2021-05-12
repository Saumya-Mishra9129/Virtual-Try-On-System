import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Wrapper = styled.div`
  padding: 1rem;
  margin: 0 auto;
  overflow: hidden;
  padding-bottom: 100%;
  height: 100%;
  

  .iframe-wrapper {
    position: relative;
    height: 1500PX;
    margin: auto;
    text-align: center;
  }
    
  .child {
    position: absolute;
    width: 100%;
    bottom: 10px;
    overflow:hidden;
    
  }
  .iframe-wrapper img{
    display: inline-block;
    margin-top: 10px

  }

  .iframe-wrapper video{
    display: inline-block;
    margin-top: 50px

  }
  
`;

export default function Home() {
  return (
    <Wrapper>
      <div className="iframe-wrapper"> 
        <img src="/web_17.jpeg" width="75%" height="50%"/>
        <a href="/demo" target="_blank">
        <video width="100%" height="50%" controls>
        <source src="web_31.mp4" type="video/mp4"/>
        Your browser does not support the video tag.
        </video></a>
      </div>
    </Wrapper>
  );
}
