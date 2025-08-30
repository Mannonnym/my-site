const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const feed = document.getElementById('feed');

// 🟢 رفع صورة جديدة
uploadBtn.addEventListener('click', async () => {
  try {
    const formData = new FormData();
    formData.append('myFile', fileInput.files[0]);

    const res = await axios.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    console.log('✅ Upload done:', res.data);

    const filename = res.data.url.split('/').pop();

    const post = document.createElement('div');
    post.classList.add('post');
    post.setAttribute('data-filename', filename); // نخزن اسم الملف

    post.innerHTML = `
      <h3>Anonymous</h3>
      <img src="${res.data.url}" alt="Uploaded Image">
      <p>New spooky image!</p>
      <button class="deleteBtn">Delete</button>
    `;
    feed.prepend(post);

  } catch (err) {
    console.error('❌ خطأ أثناء رفع الملف:', err);
  }
});

// 🟢 حذف أي صورة (قديمة أو جديدة) بالـ Event Delegation
feed.addEventListener('click', async (e) => {
  if (e.target.classList.contains('deleteBtn')) {
    const post = e.target.closest('.post');
    const filename = post.getAttribute('data-filename');
    
    try {
      const res = await axios.delete('/delete', { data: { filename } });
      console.log('🗑️ Deleted:', res.data.message);
      post.remove();
    } catch (err) {
      console.error('❌ خطأ أثناء الحذف:', err);
    }
  }
});
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await axios.get('/images');
    res.data.forEach(url => {
      const filename = url.split('/').pop();

      const post = document.createElement('div');
      post.classList.add('post');
      post.setAttribute('data-filename', filename);

      post.innerHTML = `
        <h3>Anonymous</h3>
        <img src="${url}" alt="Uploaded Image">
        <p>Old spooky image!</p>
        <button class="deleteBtn">Delete</button>
      `;
      feed.prepend(post);
    });
  } catch (err) {
    console.error('❌ خطأ أثناء جلب الصور القديمة:', err);
  }
});
