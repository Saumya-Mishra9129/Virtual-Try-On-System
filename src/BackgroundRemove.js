/* globals cv */
import React from "react";
import styled from "styled-components";
import rafSchd from "raf-schd";
import Slider from "@material-ui/core/Slider";
import { Button, Switch } from "@material-ui/core";
import greenShirtImg from "./imgs/tshirt.jpg";
import redShirtImg from "./imgs/clothes-red.jpg";
import stripeShirtImg from "./imgs/gap.jpg";

const Wrapper = styled.div`
  padding: 1rem;
  display: flex;
  overflow: auto;
  > * {
    flex: 1 0 0;
    min-width: 300px;
    canvas,
    img {
      width: 100%;
      height: auto;
    }
  }
`;

const Controls = styled.div`
  position: sticky;
  top: 80px;
  background: #fff;
  box-shadow: 0 5px 3px rgba(0, 0, 0, 0.2);
  padding: 1rem 2rem;
  z-index: 1;
  .group {
    display: flex;
    > * {
      margin: 0 1rem;
      flex: 1;
    }
  }
`;

const Chooser = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  > * {
    margin: 1rem;
  }
  .example {
    position: relative;
    img {
      width: 300px;
      height: 300px;
      object-fit: contain;
    }
    button {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 0;
    }
  }
`;

export default class BackgroundRemove extends React.Component {
  constructor() {
    super();
    this.state = {
      imgSrc: "",
      brightness: -60,
      contrast: 1.5,
      orgImg: null,
      otsuMorph: true
    };
  }

  componentWillUnmount() {
    if (this.state.orgImg) this.state.orgImg.delete();
  }
  onInputChange = e => {
    this.setState({ imgSrc: URL.createObjectURL(e.target.files[0]) });
  };
  onImgLoad = () => {
    if (this.state.orgImg) this.state.orgImg.delete();

    const orgImg = cv.imread(this.imgElement);

    this.setState({ orgImg });
    this.drawImg();
  };
  onBrightnessChange = (e, val) => {
    this.setState({ brightness: val });
    this.drawImg();
  };
  onContrastChange = (e, val) => {
    this.setState({ contrast: val });
    this.drawImg();
  };

  chooseImg = ref => {
    if (this.state.orgImg) this.state.orgImg.delete();

    const orgImg = cv.imread(ref);

    this.setState({ imgSrc: ref.getAttribute("src"), orgImg });
    this.drawImg();
  };

  /**
   * Canny edge detection
   */
  canny = () => {
    const { orgImg, brightness, contrast } = this.state;
    if (!orgImg) return;

    // contrast & brightness
    const canny = new cv.Mat();
    orgImg.convertTo(canny, -1, contrast, brightness);
    cv.imshow("cannyContrastBrightness", canny);

    // gray->blur->canny
    cv.cvtColor(canny, canny, cv.COLOR_BGR2GRAY);
    cv.GaussianBlur(canny, canny, { width: 9, height: 9 }, 0);
    cv.Canny(canny, canny, 100, 200);
    cv.imshow("cannyEdge", canny);

    // find contours (and sort by area?)
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      canny,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // mask: flood fill
    const mask = cv.Mat.zeros(canny.rows, canny.cols, canny.type());
    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      cv.fillConvexPoly(mask, contour, [255, 255, 255, 1]);
      contour.delete();
    }
    // smooth mask and blur
    const tempMat = new cv.Mat();
    cv.dilate(mask, mask, tempMat, { x: -1, y: -1 }, 10);
    cv.erode(mask, mask, tempMat, { x: -1, y: -1 }, 10);
    cv.GaussianBlur(mask, mask, { width: 9, height: 9 }, 0);
    tempMat.delete();
    cv.imshow("cannyMask", mask);

    // blend result
    const foreground = new cv.Mat();
    // Convert Mat to float data type
    orgImg.convertTo(foreground, cv.CV_32FC4, 1 / 255);
    // Normalize the alpha mask to keep intensity between 0 and 1
    const newMask = new cv.Mat();
    const maskStack = new cv.MatVector();
    mask.convertTo(mask, cv.CV_32FC4, 1.0 / 255);
    maskStack.push_back(mask);
    maskStack.push_back(mask);
    maskStack.push_back(mask);
    maskStack.push_back(mask);
    cv.merge(maskStack, newMask);
    // console.log(newMask.type(), foreground.type(), orgImg.type());
    cv.multiply(newMask, foreground, foreground);
    foreground.convertTo(foreground, cv.CV_8UC3, 255);
    cv.imshow("cannyResult", foreground);

    // cleanup
    foreground.delete();
    mask.delete();
    contours.delete();
    hierarchy.delete();
    canny.delete();
  };

  /*******
   * Otsu's Thresholding
   * https://stackoverflow.com/a/58615787/4997172
   */
  otsu = () => {
    const { orgImg, brightness, contrast } = this.state;
    if (!orgImg) return;

    const otsu = new cv.Mat();

    // contrast & brightness
    orgImg.convertTo(otsu, -1, contrast, brightness);
    cv.imshow("otsuContrastBrightness", otsu);

    //gray->otsu's threshold
    cv.cvtColor(otsu, otsu, cv.COLOR_BGR2GRAY);
    cv.threshold(otsu, otsu, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
    cv.imshow("otsuThreshold", otsu);

    // morph
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, {
      width: 3,
      height: 3
    });
    // cv.morphologyEx(otsu, otsu, cv.MORPH_OPEN, kernel, { x: -1, y: -1 }, 3);
    // cv.imshow("otsuMorph", otsu);

    // dilate erode
    if (this.state.otsuMorph) {
      const tempMat = new cv.Mat();
      cv.dilate(otsu, otsu, tempMat, { x: -1, y: -1 }, 3);
      cv.erode(otsu, otsu, tempMat, { x: -1, y: -1 }, 3);
      cv.imshow("otsuMorph", otsu);
      tempMat.delete();
    } else {
      cv.imshow("otsuMorph", otsu);
    }

    // contour
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      otsu,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );
    // find max
    let maxArea = 0;
    let maxIndex = -1;
    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      // isConvex: cv.isContourConvex(contour),
      const area = cv.contourArea(contour);
      // console.log(area);
      if (area > maxArea) {
        maxArea = area;
        maxIndex = i;
      }
      contour.delete();
    }

    // draw contours
    const contourOutput = cv.Mat.zeros(otsu.rows, otsu.cols, cv.CV_8UC3);
    const contourDraw = cv.Mat.zeros(otsu.rows, otsu.cols, cv.CV_8UC3);
    // for (let i = 0; i < contours.size(); ++i) {
    // const color = [
    //   Math.floor(Math.random() * 256),
    //   Math.floor(Math.random() * 256),
    //   Math.floor(Math.random() * 256),
    //   0.5
    // ];
    // cv.drawContours(
    //   contourOutput,
    //   contours,
    //   i,
    //   color,
    //   1,
    //   cv.LINE_8,
    //   hierarchy,
    //   0
    // );
    cv.drawContours(
      contourDraw,
      contours,
      maxIndex,
      [255, 255, 255, 1],
      1,
      cv.LINE_8,
      hierarchy,
      0
    );
    // cv.drawContours(contourOutput, contours, i, [255, 255, 255, 1], -1);
    cv.drawContours(contourOutput, contours, maxIndex, [255, 255, 255, 1], -1);
    // }
    // cv.imshow("otsuContour", contourOutput);
    // cnts = sorted(cnts, key=cv.contourArea, reverse=True)
    // for c in cnts:
    //     cv.drawContours(mask, [c], -1, (255,255,255), -1)
    //     break
    cv.imshow("otsuContour", contourDraw);

    const mask = cv.Mat.zeros(otsu.rows, otsu.cols, otsu.type());
    cv.morphologyEx(
      contourOutput,
      mask,
      cv.MORPH_CLOSE,
      kernel,
      { x: -1, y: -1 },
      3
    );

    cv.cvtColor(mask, mask, cv.COLOR_BGR2GRAY);
    cv.bitwise_and(orgImg, orgImg, otsu, mask);
    cv.imshow("otsuResult", otsu);
    // result[close==0] = (255,255,255)

    // cleanup
    contours.delete();
    mask.delete();
    // cnt.delete();
    contourOutput.delete();
    hierarchy.delete();
    otsu.delete();
  };

  _drawImg = () => {
    this.otsu();
    this.canny();
  };
  drawImg = rafSchd(this._drawImg);

  render() {
    return (
      <div>
        <Controls>
          <div className="group">
            <label>
              Contrast (alpha)
              <Slider
                min={1.0}
                max={3.0}
                step={0.01}
                valueLabelDisplay="auto"
                value={this.state.contrast}
                onChange={this.onContrastChange}
              />
            </label>

            <label>
              Brightness (beta)
              <Slider
                min={-300}
                max={300}
                step={1}
                valueLabelDisplay="auto"
                value={this.state.brightness}
                onChange={this.onBrightnessChange}
              />
            </label>
          </div>
        </Controls>

        <Chooser>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="contained-button-file"
            type="file"
            onChange={this.onInputChange}
          />
          <label htmlFor="contained-button-file">
            <Button variant="contained" color="primary" component="span">
              Upload Image
            </Button>
          </label>

          <div className="example">
            <img
              ref={el => (this.redShirtRef = el)}
              src={redShirtImg}
              alt="red-shirt"
            />
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => this.chooseImg(this.redShirtRef)}
            >
              Choose
            </Button>
          </div>
          <div className="example">
            <img
              ref={el => (this.greenShirtRef = el)}
              src={greenShirtImg}
              alt="green-shirt"
            />
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => this.chooseImg(this.greenShirtRef)}
            >
              Choose
            </Button>
          </div>
          <div className="example">
            <img
              ref={el => (this.stripeShirtRef = el)}
              src={stripeShirtImg}
              alt="stripe-shirt"
            />
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => this.chooseImg(this.stripeShirtRef)}
            >
              Choose
            </Button>
          </div>
        </Chooser>

        <h2>Canny Edge Detection</h2>
        <Wrapper>
          <div className="original">
            <h2>Original Image</h2>
            {this.state.imgSrc && (
              <img
                src={this.state.imgSrc}
                alt=""
                onLoad={this.onImgLoad}
                ref={el => (this.imgElement = el)}
              />
            )}
          </div>

          <div className="after">
            <h2>Contrast/Brightness</h2>
            <canvas id="cannyContrastBrightness"></canvas>
          </div>
          <div>
            <h2>Edge Detection</h2>
            <canvas id="cannyEdge"></canvas>
          </div>
          <div>
            <h2>Mask</h2>
            <canvas id="cannyMask"></canvas>
          </div>
          <div>
            <h2>Result</h2>
            <canvas id="cannyResult"></canvas>
          </div>
        </Wrapper>

        <h2>Otsu's thresholding</h2>
        <Wrapper>
          <div className="original">
            <h2>Original Image</h2>
            {this.state.imgSrc && (
              <img
                src={this.state.imgSrc}
                alt=""
                onLoad={this.onImgLoad}
                ref={el => (this.imgElement = el)}
              />
            )}
          </div>

          <div className="after">
            <h2>Contrast/Brightness</h2>
            <canvas id="otsuContrastBrightness"></canvas>
          </div>
          <div className="after">
            <h2>Threshold</h2>
            <canvas id="otsuThreshold"></canvas>
          </div>
          <div>
            <h2>
              Morph noise
              <Switch
                checked={this.state.otsuMorph}
                onChange={e => {
                  this.setState({ otsuMorph: e.target.checked });
                  this.drawImg();
                }}
              />
            </h2>
            <canvas id="otsuMorph"></canvas>
          </div>
          <div>
            <h2>Contour</h2>
            <canvas id="otsuContour"></canvas>
          </div>
          <div>
            <h2>Result</h2>
            <canvas id="otsuResult"></canvas>
          </div>
        </Wrapper>
      </div>
    );
  }
}
