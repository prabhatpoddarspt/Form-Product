import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFile = async (req, res) => {
  try {
    if (req.files && req.files.file) {
      const imageFile = req.files.file;

      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        return res.status(400).json({
          error: "File size must not exceed the 5MB.",
        });
      }

      const extension = imageFile.name.split(".").pop();
      const sixDigitRandom = Math.floor(Math.random() * 900000 + 100000);
      const timestamp = Date.now().toString();
      const fileName = `file_${sixDigitRandom}_${timestamp}.${extension}`;

      const uploadDir = path.join(__dirname, "..", "uploads");
      const filePath = path.join(uploadDir, fileName);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(filePath, imageFile.data);
      const baseUrl =
        process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
      const fileUrl = `${baseUrl}/uploads/${fileName}`;

      res.status(200).json({
        data: fileUrl,
        success: true,
        msg: "File Uploaded Successfully!",
      });
    } else {
      res.status(400).json({ error: "File Not Found" });
    }
  } catch (err) {
    console.error(err);
    const error = err.message || "Internal Server Error";
    res.status(500).json({ error });
  }
};
