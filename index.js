const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const multer = require('multer');
const { google } = require("googleapis");

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


// Folder ID jahan files upload hongi
const FOLDER_ID = "1iXBLU3gwi-8hpQ0JapTHyk4frn7j0UJ6";





const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});


// Google Drive client
const drive = google.drive({ version: "v3", auth });

// File upload function
async function uploadToDrive(fileName, filePath) {
  const fileMetadata = {
    name: fileName,
    parents: [FOLDER_ID],
  };
  const media = {
    mimeType: "model/gltf-binary",
    body: fs.createReadStream(filePath),
  };
  const file = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id, webViewLink, webContentLink",
  });
  return file.data; // yahan se link mil jayega
}


app.post("/uploadmega", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file received (field name must be 'file')." });
    }

    const { originalname, path: tempPath } = req.file;
    console.log("📥 Received:", originalname, tempPath);

    // Upload to Google Drive
    const publicLink = await uploadToDrive(originalname, tempPath);

    // Delete temp file
    fs.unlinkSync(tempPath);

    // Return ONLY the link
    res.json({ link: publicLink.webViewLink });
    // or: res.json({ link: publicLink.webContentLink });
  } catch (err) {
    console.error("❌ UploadGoogleDrive Error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});






// Routes
app.use('/client', require('./Routes/ClientRoutes.js'));

app.get('/', (req, res) => {
  res.send("Server is working");
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is Listening on Port: ${PORT}`);
});
