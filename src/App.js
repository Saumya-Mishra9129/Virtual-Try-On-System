import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Button, AppBar, Toolbar } from "@material-ui/core";
import styled from "styled-components";
import ReactNotification from "react-notifications-component";
import "react-notifications-component/dist/theme.css";

import BackgroundRemove from "./BackgroundRemove";
import Pipeline from "./Pipeline";
import NewPipeline from "./NewPipeline";
import Home from "./Home";

const Wrapper = styled.div`

  .AppBar{
    background-color: #FFB6C1;
    font-family: "Georgia, serif";

  }
  
  .button{
    background-color: #006644;
    border: none;
    color: white;
    text-align: center;
    text-style: bold;
    display: inline-block;
    margin: 4px 4px;
    cursor: pointer;
    -webkit-transition-duration: 0.4s; /* Safari */
    transition-duration: 0.4s;
    }
  


  .button1 {
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
  }

  .appbar-title {
    margin-right: auto;

    a {
      color: white;
      font-family: "Brush Script MT";

    }
  }
  .appbar-link {
    margin: 0 0.5rem;
  }

  .video-page {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  /* responsive youtube */
  .video-responsive {
    overflow: hidden;
    padding-bottom: 56.25%;
    position: relative;
    height: 0;
  }

  .video-responsive iframe {
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    position: absolute;
  }
`;

export default function App() {
  return (
    <Router>
      <Wrapper>
        <ReactNotification />
        <AppBar position="sticky" className="AppBar">
          <Toolbar>
            <h1 className="appbar-title">
              Virtual Drape On
            </h1>

            <Button
              className="appbar-link button button1"
              component={Link}
              to="/demo"
              variant="contained"
            >
              Let's have a trial
            </Button>


            <Button
              className="appbar-link button button1"
              component={Link}
              to="/video"
              variant="contained"
            >
              See Video
            </Button>


            <Button
              className="appbar-link button button1"
              component={Link}
              to=""
              variant="contained"
            >
              Github
            </Button>

          </Toolbar>
        </AppBar>

        {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/demo" exact>
            <Pipeline />
          </Route>

          <Route path="/new" exact>
            <NewPipeline />
          </Route>

          <Route path="/video" exact>
            <div className="video-page">
              <h2>Presentation Video</h2>
              <div className="video-responsive">
                <iframe
                  title="presentation video"
                  width="560"
                  height="315"
                  src=""
                  frameBorder="0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </Route>

          <Route path="/background-remove" exact>
            <BackgroundRemove />
          </Route>
        </Switch>
      </Wrapper>
    </Router>
  );
}
