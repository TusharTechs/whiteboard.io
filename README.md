# Whiteboard.IO

Whiteboard.IO is a collaborative online whiteboard application built with React, Konva, and Socket.IO. It allows users to draw, share ideas, and communicate in real-time.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Keycloak Authentication:** Authenticated user registration and Login with Keycloak using docker.
- **Real-time Collaboration:** Multiple users can draw and interact simultaneously.
- **Drawing Tools:** Brush, different brush sizes, undo/redo functionality, color picker.
- **Image Prediction:** Utilizes an image detection feature.
- **Chat Integration:** Includes a chat panel for communication among users.
- **Recording Capability:** Allows recording whiteboard sessions.

## Demo

1. Keycloak Login Page
![Screenshot_16](https://github.com/TusharTechs/whiteboard.io/assets/56952465/7154a5c2-8f11-42d4-845f-4847a757b9e2)

2. Image Prediction with a pre-trained ML model
![Screenshot_11](https://github.com/TusharTechs/whiteboard.io/assets/56952465/fc39040b-845c-4069-9498-d865481be175)

3. Whiteboard to draw on with different brush sizes and colors
![Screenshot_12](https://github.com/TusharTechs/whiteboard.io/assets/56952465/2a13ce8b-1221-45a1-9911-e21d5b2afccb)

4. Real-time collaboration whiteboard
![Screenshot_13](https://github.com/TusharTechs/whiteboard.io/assets/56952465/f5a794ba-8629-4470-ab4c-5ebe0952bd30)

5. Real-time Livechat with Socket.IO
![Screenshot_14](https://github.com/TusharTechs/whiteboard.io/assets/56952465/464b6258-15b9-49c4-9a7a-43989fc55150)

6. Recording the screen with Media Recorder API.
![Screenshot_15](https://github.com/TusharTechs/whiteboard.io/assets/56952465/d65537e2-7b25-45d9-bee1-58688a08e5b5)

7. Responsiveness on all screen sizes.
![Screenshot_17](https://github.com/TusharTechs/whiteboard.io/assets/56952465/a562797e-cebc-4336-b19c-713d34cdf663)

## Installation

To install and run this application locally, follow these steps:

1. Clone this repository.
`git clone https://github.com/your-username/whiteboard-io.git`
2. Install dependencies.
`cd whiteboard-io`
`npm install`
3. Start the application.
`npm start`
4. Access the application at http://localhost:3000

## Usage

- Choose between drawing modes (brush or shape).
- Use the various tools available: brush sizes, color picker, undo/redo.
- Interact with the whiteboard in real-time with other users.
- Utilize the image prediction feature and the integrated chat panel.

## Technologies Used

- React
- Konva
- Socket.IO
- jspdf
- Tensorflow
- MediaRecorder API
- Bootstrap

## Contributing

Contributions are welcome! To contribute to Whiteboard.IO, follow these steps:

1. Fork this repository.
2. Create a branch: git checkout -b feature/my-feature.
3. Make your changes and commit them: git commit -m 'Add new feature'.
4. Push to the branch: git push origin feature/my-feature.
5. Submit a pull request.

## License

This project is licensed under the MIT License.
