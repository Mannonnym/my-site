const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require("./db");
const authMiddleware = require("./middleware/auth"); 
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "supersecretkey";
const app = express();
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let db, users;

async function start() {
  db = await connectDB();
  users = db.collection("users");
}
start();



app.post("/add", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: "⚠️ كل الحقول مطلوبة" });
  }

  try {
    const existingUser = await users.findOne({ username });

    if (existingUser) {
   
      return res.json({ success: false, message: "❌ Username already exists" });
    }

   
    await users.insertOne({ username, email, password , friends: []});
    res.json({ success: true, message: "✅ User added to MongoDB" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "⚠️ Server error" });
  }
});




// ✅ Login API
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "كل الحقول مطلوبة" });
  }

  try {
    const user = await users.findOne({ username, password }); 
    if (!user) {
      return res.status(401).json({ success: false, message: "❌ Invalid username or password" });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token });
  } catch (err) {
   
    console.error("❌ Error in /login:", err);
    res.status(500).json({ success: false, error: "⚠️ Server error" });
  }
});






app.post("/ajoute", authMiddleware, async (req, res) => {
  const { username } = req.body;
  const currentUser = req.user.username;
  if (!username || (username==currentUser)) {
    return res.status(400).json({ success: false, error: "error" });
  }

  try {
  const exists = await db.collection("friends").findOne({
  userId: currentUser,
  friendId: username
});
    if (exists) {
      return res.json({ success: false, message: "❌ العلاقة موجودة مسبقا" });
    }

    await db.collection("friends").insertOne({
      userId: currentUser,
      friendId: username,
      status: "pending",
      createdAt: new Date()
    });

    res.json({ success: true, message: "✅ طلب صداقة أُرسل", username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


app.get("/ajoute", authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user.username;
    const requests = await db.collection("friends")
      .find({ userId: currentUser })
      .toArray();

    res.json({ success: true, requests });
  } catch (err) {
    console.error("❌ Error in /my-requests:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});




app.get("/friends/sent", authMiddleware, async (req, res) => {
  const currentUser = req.user.username;
  const sent = await db.collection("friends").find({ userId: currentUser }).toArray();
  res.json({ success: true, sent });
});
app.get("/friends/received", authMiddleware, async (req, res) => {
  const currentUser = req.user.username;
  const received = await db.collection("friends").find({ friendId: currentUser, status: "pending" }).toArray();
  res.json({ success: true, received });
});

app.put("/friends/:id", authMiddleware, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { action } = req.body;
    const currentUser = req.user.username;

    const request = await db.collection("friends").findOne({ _id: new ObjectId(requestId) });
    if (!request) {
      return res.status(404).json({ success: false, message: "❌ Request not found" });
    }

    if (action === "accepted") {
      await db.collection("friends").updateOne(
        { _id: new ObjectId(requestId), friendId: currentUser },
        { $set: { status: "accepted" } }
      );
      return res.json({ success: true, message: "✅ Request accepted" });
    }

    if (action === "refused") {
      await db.collection("friends").deleteOne({ _id: new ObjectId(requestId), friendId: currentUser });
      return res.json({ success: true, message: "🚫 Request refused" });
    }

    res.status(400).json({ success: false, message: "❌ Invalid action" });
  } catch (err) {
    console.error("❌ Error in PUT /friends/:id:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.get("/friends", authMiddleware, async (req, res) => {
  const currentUser = req.user.username;

 
  const friends = await db.collection("friends").find({
    $or: [
      { userId: currentUser, status: "accepted" },
      { friendId: currentUser, status: "accepted" }
    ]
  }).toArray();

  res.json({ success: true, friends });
});






app.delete("/friends/:id", authMiddleware, async (req, res) => {
  try {
    const requestId = req.params.id;
    const currentUser = req.user.username;

    await db.collection("friends").deleteOne({
      _id: new ObjectId(requestId),
      userId: currentUser
    });

    res.json({ success: true, message: "❌ Request canceled" });
  } catch (err) {
    console.error("❌ Error in DELETE /friends/:id:", err);
    res.status(500).json({ success: false, error: "Server error" });
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
