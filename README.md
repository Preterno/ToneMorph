# ToneMorph

ToneMorph is a versatile media processing application that simplifies the conversion of images and videos to grayscale. For images, users can dynamically adjust brightness, sharpness, and contrast, while videos are seamlessly processed to grayscale. The platform integrates secure token-based authentication, WebSocket support for real-time video processing, and a feature-rich backend to ensure a smooth and efficient user experience.

## Deployment

The application is deployed at: [http://54.66.53.54:8080/](http://54.66.53.54:8080/).

## Features

- Enables **image processing**: Convert images to grayscale with adjustable brightness, sharpness, and contrast controls.
- Supports **video processing**: Seamlessly convert videos to grayscale using optimized pipelines.
- Provides **secure authentication**: Token-based system for reliable access control.
- Integrates **frontend and backend**: A responsive user interface powered by a robust backend for media handling.

## Technologies and Libraries

### **Frontend:**

- React
- Tailwind CSS
- Formik & Yup (Form validation)
- React Router (Navigation)
- Toastify (Notifications)

### **Backend:**

- Node.js with Express.js
- WebSocket (Real-time video processing)
- Multer (File uploads)
- Sharp (Image processing)
- FFmpeg (Video processing)
- Bcrypt (Password encryption)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Preterno/ToneMorph.git
cd ToneMorph
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```
JWT_SECRET=your_secret_key  # Secret key for JWT authentication
EMAIL=your_email@example.com  # Admin email address
PASSWORD=hashed_password  # Hashed password for admin login
PORT=3000  # Port for backend server
VITE_API_BASE_URL=http://localhost:3000/  # API base URL for the frontend
```

### 4. Run the Application

#### Start the Backend:

```bash
npm run server
```

The backend will be hosted at: `http://localhost:3000`

#### Start the Frontend:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Connect with Me

Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/aslam8483).
