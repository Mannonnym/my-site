const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const feed = document.getElementById('feed'); 


uploadBtn.addEventListener('click', () => {
 
  const formData = new FormData();
  formData.append('myFile', fileInput.files[0]); 

  
  axios.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  .then(res => {
    console.log('done',res.data);

  
    const post = document.createElement('div');
   post.innerHTML = `
  <h3>Anonymous</h3>
  <img src="${res.data.url}" alt="Uploaded Image">
  <p>New spooky image!</p>
  <button class="deleteBtn">Delete</button>
`;

    feed.prepend(post);

const deleteBtn = post.querySelector('.deleteBtn');
deleteBtn.addEventListener('click', () => {
  axios.delete('/delete', { data: { filename: res.data.url.split('/').pop() } })
    .then(r => {
      console.log(r.data.message);
      post.remove();
    })
    .catch(err => console.error(err));
});

  })
  .catch(err => {
    console.error('error❌ ', err);
  });
});