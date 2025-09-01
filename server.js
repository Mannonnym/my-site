const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require("./db");
const app = express();
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let users; 

async function start() {
  const db = await connectDB();
  users = db.collection("users");
}
start();


// ✅ API لإضافة مستخدم
app.post("/add", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "كل الحقول مطلوبة" });
  }

  await users.insertOne({ username, email, password });
  res.json({ message: "✅ User added to MongoDB" });
});



app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "كل الحقول مطلوبة" });
  }

  const user = await users.findOne({ username, password }); 

  if (user) {
    res.json({ success: true, message: "✅ Login successful" });
  } else {
    res.status(401).json({ success: false, message: "❌ Invalid username or password" });
  }
});


app.post("/ajoute", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, error: "⚠️ Username required" });
  }

  const user = await users.findOne({ username });

  if (user) {
    res.json({ success: true, username: user.username });
  } else {
    res.status(404).json({ success: false, message: "❌ User not found" });
  }
});


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
