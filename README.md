To wrap up our project, we dockerize each module (openpose, LIP_JPPNet, cp-vton) and deploy a demo website on Google Cloud Platform using both Cloud Function and Cloud Run. In the website, users can upload whatever cloth and model image they want, then our backend will parse those input and feed into our BadgerFIT pipeline. Finally, the virtual try-on result will show as well as the intermediate result such as image segmentation, image keypoints on the website. This is a react js application.

## How to Install Yarn ?

In the project directory run following command:

### `yarn`


## How to Run ?

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).






















