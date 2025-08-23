const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder); 
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName); 
  }
});

const upload = multer({ storage });


app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.post('/upload', upload.single('myFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
  }

  
  res.json({
    message: 'تم رفع الملف بنجاح ',
    url: '/uploads/' + req.file.filename
  });
});
app.delete('/delete', (req, res) => {
  const filename = req.body.filename; 
  const filePath = path.join(__dirname, 'uploads', filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'error'});
    }
    res.json({ message: 'done' });
  });
});



app.listen(5000, () => {
  console.log('✅ Server running at http://localhost:5000');
});
