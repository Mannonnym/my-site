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
app.get("/search/:username", (req, res) => {
  const username = req.params.username;
  const accountPath = path.join(__dirname, "uploads", `${username}.json`);

  fs.access(accountPath, fs.constants.F_OK, (err) => {
    if (err) {
      res.json({ found: false });
    } else {
      res.json({ found: true, username });
    }
  });
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));

});
app.get('/images', (req, res) => {
  fs.readdir(uploadFolder, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'حدث خطأ عند قراءة الملفات' });
    }
    // نرجع array URLs
    const urls = files.map(file => '/uploads/' + file);
    res.json(urls);
  });
});


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
