const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const multer = require('multer');
const { google } = require("googleapis");
const { S3Client, PutObjectCommand } =  requir('@aws-sdk/client-s3');

dotenv.config();

const app = express();
const connectdb = require('./Config/Db.js');

app.use(express.json());

const allowedOrigins = [
  "https://flex3d-c1-5e3e.vercel.app",
  "https://flex3d.shop"
];


app.use(cors());


connectdb();


const upload = multer({ dest: "uploads/" });


// Cloudflare R2 client setup
const s3 = new S3Client({
  region: "auto",
  endpoint: "https://081611aef2796aa74fbcdbdeb3099f32.r2.cloudflarestorage.com", // apna R2 endpoint yahan dalna
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// File upload helper function
async function uploadFile(fileBuffer, fileName, mimeType) {
  const command = new PutObjectCommand({
    Bucket: "flex3dmodels", 
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3.send(command);

  // return public URL
  return `https://cdn.flex3d.shop/${fileName}`;
}


app.post("/uploadglbfile", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;
    const fileName = Date.now() + "-" + req.file.originalname; // unique filename
    const mimeType = req.file.mimetype;

    const link = await uploadFile(fileBuffer, fileName, mimeType);

    res.json({ link });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});





app.use('/client', require('./Routes/ClientRoutes.js'));

app.get('/', (req, res) => {
  res.send("Server is working");
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is Listening on Port: ${PORT}`);
});
