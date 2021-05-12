/* globals cv */
import React from "react";
import styled from "styled-components";
import axios from "axios";
import { Button, Paper } from "@material-ui/core";
import ReactJson from "react-json-view";
import Jimp from "jimp/es";
import { store } from "react-notifications-component";

import { dataURL2file, loadOneImg, img2dataURL } from "./image-processing";
import Loading from "./Loading";
import modelImg from "./imgs/test-model.jpg";
import model4Img from "./imgs/test-model2.jpg";
import model3Img from "./imgs/upload2.jpeg";
import model2Img from "./imgs/model_4.jpeg";
import model6Img from "./imgs/model_2.jpeg";
import model7Img from "./imgs/model_5.jpg";
import model8Img from "./imgs/model_6.png";


import clothBlueImg from "./imgs/test-blue.png";
import clothRedImg from "./imgs/test-new2.png";
import clothGreenImg from "./imgs/test-new1.png";
import clothPurpleImg from "./imgs/test-red.png";
import clothGrayImg from "./imgs/test-new3.png";
import cloth1Img from "./imgs/test-new4.png";
import cloth2Img from "./imgs/test-new5.png";





const Wrapper = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;

  flex-wrap: wrap;
  justify-content: center;
  text-align:center;


  > .MuiPaper-root {
    padding: 40px;
    flex-wrap: wrap;
    display:flex;
    margin: 1rem;
    justify-content: center;
    background-image: url("/bg.jfif"); 
    background-repeat: no-repeat; 
    background-size: cover;
    background-position: center;






  }


@import url('https://fonts.googleapis.com/css?family=Arimo:400,700&display=swap');
.warpper{
  display:flex;
  flex-direction: column;
  align-items: center;
}
.tab{
  cursor: pointer;
  padding:10px 20px;
  margin:0px 2px;
  background:#006644;
  display:inline-block;
  color:#fff;
  border-radius:3px 3px 0px 0px;
}
.panels{
  background:#fffffff6;
  box-shadow: 0 2rem 2rem #00000088;
  min-height:400px;
  width:100%;
  border-radius:3px;
  overflow:hidden;
  padding:20px;  
}
.panel{
  display:none;
  animation: fadein .8s;
}
@keyframes fadein {
    from {
        opacity:0;
    }
    to {
        opacity:1;
    }
}
.panel-title{
  font-size:1.3em;
  font-weight:bold;
  padding:20px;
}
.radio{
  display:none;
}
#one:checked ~ .panels #one-panel,
#two:checked ~ .panels #two-panel,
#three:checked ~ .panels #three-panel{
  display:block
}
#one:checked ~ .tabs #one-tab,
#two:checked ~ .tabs #two-tab,
#three:checked ~ .tabs #three-tab{
  background:#fffffff6;
  color:#000;
  border-top: 3px solid #000;
}


  .block {
    position: relative;
    min-height: 300px;
    width: 500px;
    .loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      transition: background 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .break {
    flex-basis: 100%;
    height: 100%;
  }

  .item-wide { flex-grow: 3; }

  .fl{
    flex-wrap: wrap;
    display:flex;
    margin: auto;
    justify-content: center;


  }

  .examples {
    overflow-x: auto;
    display: flex;
    align-items: center;
    > * {
      margin: 1rem;
    }
  }
  .example {
    display: inline-block;
    position: relative;
    align-items:center;
    img {
      width: 192px;
      height: 256px;
      object-fit: contain;
    }

    button {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 0;
      background-color: #006644;
      border: none;
      color: white;
    }
  }
`;

export default class Pipeline extends React.Component {
  state = {
    modelUrl: null,
    modelFile: null,
    clothUrl: null,
    clothFile: null,
    clothCV: null,
    clothMaskFile: null,
    openpose: null,
    openposeLoading: false,
    jppnet: null,
    jppnetLoading: false,
    cpvton: null,
    cpvtonLoading: false,
  };

  callOpenposeAndJppnet = (file) => {
    this.setState({
      openposeLoading: true,
      jppnetLoading: true,
    });

    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("https://openpose-s3mg3fuleq-uc.a.run.app/", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
      })
      .then((response) => {
        this.setState({
          openposeLoading: false,
          openpose: {
            rendered: `data:image/png;base64,${response.data.rendered}`,
            keypoints: JSON.parse(response.data.keypoints),
          },
        });
      })
      .catch((error) => {
        this.setState({ openposeLoading: false });
        console.log(error);
        store.addNotification({
          title: "Error in Openpose",
          message: error.message,
          type: "danger",
          insert: "top",
          container: "top-right",
          dismiss: {
            duration: 0,
            showIcon: true,
          },
        });
      });

    axios
      .post("https://lip-jppnet-s3mg3fuleq-uc.a.run.app/", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
      })
      .then((response) => {
        this.setState({
          jppnetLoading: false,
          jppnet: {
            output: `data:image/png;base64,${response.data.output}`,
            vis: `data:image/png;base64,${response.data.vis}`,
          },
        });
      })
      .catch((error) => {
        this.setState({ jppnetLoading: false });
        console.log(error);
        store.addNotification({
          title: "Error in LIP_JPPNet",
          message: error.message,
          type: "danger",
          insert: "top",
          container: "top-right",
          dismiss: {
            duration: 0,
            showIcon: true,
          },
        });
      });
  };

  callCpvton = () => {
    const {
      modelFile,
      clothFile,
      clothMaskFile,
      openpose,
      jppnet,
      cpvtonLoading,
    } = this.state;

    if (cpvtonLoading) return;

    this.setState({ cpvtonLoading: true, cpvton: null });

    // generate pose.json
    const poseFile = new Blob([JSON.stringify(openpose.keypoints)], {
      type: "text/plain;charset=utf-8",
    });

    const formData = new FormData();
    formData.append("model", modelFile);
    formData.append("model-parse", dataURL2file(jppnet.output));
    formData.append("cloth", clothFile);
    formData.append("cloth-mask", clothMaskFile);
    formData.append("pose", poseFile);
    axios
      .post("https://cpvton-s3mg3fuleq-uc.a.run.app/", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
      })
      .then((response) => {
        this.setState({
          cpvtonLoading: false,
          cpvton: {
            warpCloth: `data:image/jpeg;base64,${response.data["warp-cloth"]}`,
            warpMask: `data:image/jpeg;base64,${response.data["warp-mask"]}`,
            tryon: `data:image/jpeg;base64,${response.data.tryon}`,
          },
        });
      })
      .catch((error) => {
        this.setState({ cpvtonLoading: false });
        console.log(error);
        store.addNotification({
          title: "Error in CP-VTON",
          message: error.message,
          type: "danger",
          insert: "top",
          container: "top-right",
          dismiss: {
            duration: 0,
            showIcon: true,
          },
        });
      });
  };

  generateMask = (clothCV) => {
    const channels = new cv.MatVector();
    const r = new cv.Mat();
    channels.push_back(r);
    const g = new cv.Mat();
    channels.push_back(g);
    const b = new cv.Mat();
    channels.push_back(b);
    const a = new cv.Mat();
    channels.push_back(a);

    cv.split(clothCV, channels);

    const mask = new cv.Mat();
    // only apply on the alpha channel
    const alpha = channels.get(3);
    cv.threshold(alpha, mask, 254, 255, cv.THRESH_BINARY);
    cv.imshow("clothMask", mask);

    // get mask from canvas...
    const canvas = document.querySelector("#clothMask");
    const clothMaskUrl = canvas.toDataURL("image/jpeg");
    const clothMaskFile = dataURL2file(clothMaskUrl, "mask.jpg");
    this.setState({ clothMaskFile });

    // cleanup
    r.delete();
    g.delete();
    b.delete();
    a.delete();
    channels.delete();
    alpha.delete();
    mask.delete();
  };

  onUploadModel = async (e) => {
    if (e.target.files.length < 1) return;

    // resize
    const img = await Jimp.read(URL.createObjectURL(e.target.files[0]));
    img.contain(192, 256);
    img.background(0xffffffff);
    // console.log(img);

    const modelUrl = await img.getBase64Async(Jimp.MIME_JPEG);
    const modelFile = dataURL2file(modelUrl);

    this.setState({
      modelFile,
      modelUrl,
      openpose: null,
      jppnet: null,
    });

    this.callOpenposeAndJppnet(modelFile);
  };

  onUploadClothes = async (e) => {
    if (e.target.files.length < 1) return;

    // resize
    const img = await Jimp.read(URL.createObjectURL(e.target.files[0]));
    img.contain(192, 256);

    // use png to have transparent for mask generation
    const clothCV = cv.imread(
      await loadOneImg(await img.getBase64Async(Jimp.MIME_PNG))
    );

    // set background to white
    img.background(0xffffffff);
    // console.log(img);

    const clothUrl = await img.getBase64Async(Jimp.MIME_JPEG);
    const clothFile = dataURL2file(clothUrl);

    if (this.state.clothCV) this.state.clothCV.delete();

    this.setState({ clothFile, clothUrl, clothCV });

    this.generateMask(clothCV);
  };

  onChooseModel = async (url) => {
    const img = await loadOneImg(url);
    const dataURL = img2dataURL(img);
    const file = dataURL2file(dataURL);
    this.onUploadModel({ target: { files: [file] } });
  };

  onChooseCloth = async (url) => {
    const img = await loadOneImg(url);
    const dataURL = img2dataURL(img);
    const file = dataURL2file(dataURL);
    this.onUploadClothes({ target: { files: [file] } });
  };

  camera_stream = () =>{
    var video = document.getElementById('video');

// Get access to the camera!
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        //video.src = window.URL.createObjectURL(stream);
        video.srcObject = stream;
        video.play();
    });
    }


  };
  canvas_to_image = () =>{
      var canvas = document.getElementById("canvas");
      var ctx=canvas.getContext("2d");
      //draw a red box
      
      var url = canvas.toDataURL();
      return url
  };

  camera_on = () => {

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var video = document.getElementById('video');

    // Trigger photo take
    document.getElementById("snap").addEventListener("click", function() {
    var timeleft = 10;

    var downloadTimer = setInterval(function function1(){
    document.getElementById("snap").innerHTML = timeleft + 
    " "+"seconds remaining";

    timeleft -= 1;
    if(timeleft <= 0){
        clearInterval(downloadTimer);
        document.getElementById("snap").innerHTML = "Time is up!";
        context.drawImage(video, 0, 0, 600, 800);

    }
    }, 1000);



    });

  };


  

  camera_stop = (e) => {
    var video = document.getElementById('video');

    var stream = video.srcObject;
    var tracks = stream.getTracks();

    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      track.stop();
    }

    video.srcObject = null;
  };




  render() {
    const {
      modelUrl,
      clothUrl,
      // clothFile,
      clothMaskFile,
      openpose,
      openposeLoading,
      jppnet,
      jppnetLoading,
      cpvton,
      cpvtonLoading,
    } = this.state;

    return (
      <Wrapper>
        <Paper elevation={3}>
          <div className="break">
          <h2>Choose Image/Capture a pic for Try-On</h2>
          </div>
          <div class="warpper">
            <input class="radio" id="one" name="group" type="radio" checked/>
            <input class="radio" id="two" name="group" type="radio"/>
            <div class="tabs">
            <label class="tab" id="one-tab" for="one">Upload/Choose</label>
            <label class="tab" id="two-tab" for="two">Capture</label>
            </div>
            <div class="panels">
            <div class="panel" id="one-panel">
          
          <div className="examples break">
            {[modelImg, model2Img, model3Img, model4Img, model6Img, model7Img, model8Img].map((imgUrl) => (
              <div className="example" key={imgUrl}>
                <img src={imgUrl} alt="example model" />
                <Button className="button"
                  variant="contained"
                  size="small"
                  onClick={() => this.onChooseModel(imgUrl)}
                  disabled={openposeLoading || jppnetLoading}
                >
                  Choose
                </Button>
              </div>
            ))}
          </div>
          <div align-items="center">
            {/* model input */}
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="modelInput"
              type="file"
              onChange={this.onUploadModel}
              disabled={openposeLoading || jppnetLoading}
            />
            <label htmlFor="modelInput">
              <Button className="button"
                variant="contained"
                component="span"
                disabled={openposeLoading || jppnetLoading}
                title="You can either upload your image or click one of the examples below"
              >
                Upload Image of Model
              </Button>
            </label>
          </div>
          
            </div>
            <div class="panel" id="two-panel">
            <div class="panel-title">Click on Start button to start streaming from your webcam, also make sure you allow us permission to access your webcam</div>
            <div>
            <div align-items="center">
            <Button className="button" variant="contained" onClick={this.camera_stream}>Start</Button>

          <Button id="snap" className="button" variant="contained" onClick={this.camera_on} download="image.png">Snap Photo</Button>
          <Button className="button"
                  variant="contained"
                  onClick={() => this.onChooseModel(this.canvas_to_image())}
                  disabled={openposeLoading || jppnetLoading}
                >
                  Choose
                </Button>

          <Button id="stop" className="button" variant="contained" onClick={this.camera_stop}>Stop</Button>
          </div>
          <div className="examples break">
          <video id="video" width="600px" height="600px" autoplay></video>
          <canvas id="canvas" width="600px" height="800px" align-items="center"></canvas>
          
          </div>
          </div>
            </div>
          
          </div>
          </div>


          

          

          

          <div className="block">
            <h3>Resized Image (256x192)</h3>
            {modelUrl && (
              <div>
                <img src={modelUrl} alt="" />
              </div>
            )}
          </div>
          <div className="block">
            <h3>Openpose</h3>
            <Loading
              key="openpose"
              loading={openposeLoading}
              backdrop={false}
            />
            {openpose && (
              <div>
                <h3>rendered:</h3>
                <img src={openpose.rendered} alt="" />
              </div>
            )}
            {openpose && (
              <>
                <h3>keypoints:</h3>
                <ReactJson
                  src={openpose.keypoints}
                  collapsed={3}
                  theme="monokai"
                />
              </>
            )}
          </div>
          <div className="block">
            <h3>LIP_JPPNet</h3>
            <p>
              Please wait this may take upto 60-120 seconds.
            </p>
            <Loading key="jpp" loading={jppnetLoading} backdrop={false} />
            {jppnet && (
              <div>
                <img src={jppnet.vis} alt="" />
              </div>
            )}
          </div>
        </Paper>

        <Paper elevation={3}>
          <div className="break">
          <h2>Let's Choose Your Outfit</h2>
          </div>
          <div className="examples">
            {/* clothes input */}
            <input
              accept="image/png"
              style={{ display: "none" }}
              id="clothesInput"
              type="file"
              onChange={this.onUploadClothes}
            />
            <label htmlFor="clothesInput">
              <Button variant="contained" className="button" title="Upload your image or click one of the examples below" component="span">
                Upload Image of Clothes
              </Button>
            </label>
          </div>

          <div className="examples break">
            {[
              clothRedImg,
              clothBlueImg,
              clothGreenImg,
              clothGrayImg,
              clothPurpleImg,
              cloth1Img,
              cloth2Img,
            ].map((imgUrl) => (
              <div className="example" key={imgUrl}>
                <img src={imgUrl} alt="example clothes" />
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => this.onChooseCloth(imgUrl)}
                >
                  Choose
                </Button>
              </div>
            ))}
          </div>

          <div className="block">
            <h3>Resized Image (256x192)</h3>
            {clothUrl && (
              <div>
                <img src={clothUrl} alt="" />
              </div>
            )}
          </div>

          <div className="block">
            <h2>Clothes Mask</h2>
            <canvas id="clothMask"></canvas>
          </div>
        </Paper>
        <Paper elevation={3}>
          <div className="break">
          <h2>Final Try-On</h2>
          <p>
            Finish the model pre-processing and clothes pre-processing parts,
            then you can click this button to try-on!
          </p>
          </div>
          <Button className="button"
            variant="contained"
            onClick={this.callCpvton}
            disabled={
              !jppnet ||
              !jppnet.output ||
              !openpose ||
              !openpose.keypoints ||
              !clothMaskFile
            }
          >
            Try-On!
          </Button>

          <div className="block break">
            <h3>Drape On Result:</h3>
            <Loading loading={cpvtonLoading} backdrop={false} />
            {cpvton && (
              <div className="fl">
                <div>
                  <h3>Result:</h3>
                  <img src={cpvton.tryon} alt="" />
                </div>
                <div>
                  <h4>warp cloth</h4>
                  <img src={cpvton.warpCloth} alt="" />
                </div>
                <div>
                  <h4>warp mask</h4>
                  <img src={cpvton.warpMask} alt="" />
                </div>
              </div>
            )}
          </div>
        </Paper>
      </Wrapper>
    );
  }
}
