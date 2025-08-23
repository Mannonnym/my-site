/*function hideElement() {
    const event = document.getElementById("hidd").classList.add("hidden");
  } 



function addKeyDownListener() {
    document.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        hideElement();
      }
    });
  }*/

   /* const heading= document.getElementById("hidd");
    console.log(heading);
if (event.key === "Enter") {
   // addKeyDownListener();
     hid.style.display="none";
    document.querySelector(".content").classList.remove("content");
}
else{
    setTimeout(() => {
        hid.style.display="none";
        callback();
      }, 2);

 
    
    hid(show);*/
    const sentences = [
      "Injecting memes into mainframe...",
      "Downloading cat photos...",
      "Hacking NASA with HTML...",
      "Generating useless code...",
      "Welcome to the matrix."
    ];
    let currentSentence = 0;
    let currentChar = 0;
    const typewriter = document.getElementById("typewriter");

    function type() {
      if (currentChar < sentences[currentSentence].length) {
        typewriter.textContent += sentences[currentSentence].charAt(currentChar);
        currentChar++;
        setTimeout(type, 80); // سرعة الكتابة
      } else {
        setTimeout(erase, 2000); // استنى شوية قبل ما يمسح
      }
    }
    function erase() {
      if (currentChar > 0) {
        typewriter.textContent = sentences[currentSentence].substring(0, currentChar - 1);
        currentChar--;
        setTimeout(erase, 30); // سرعة المسح
      } else {
        currentSentence = (currentSentence + 1) % sentences.length;
        setTimeout(type, 500);
      }
    }

    // بداية التأثير
    type();



   

    const enterText = document.getElementById("hidd");
    const content = document.getElementsByClassName("content")[0];
    const load=document.getElementsByClassName("loading")[0];

    content.style.display = "none";
    load.style.display = "none";
    

    function show(callback) {
      load.style.display ="block";

     

          setTimeout(() => {
        load.style.display="none";
       
        callback();
      }, 3000);
      
    }
    function show1() {
      content.style.display ="block";

    }
    
    function hide(callback) {
      
        content.style.display = "none";
        enterText.style.display = "none"; 
        load.style.display="none";
       

        callback();
    }
    
  

    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        hide(() => show(show1));
      }
    });


/*document.addEventListener('DOMContentLoaded', () => {
  const enterText = document.getElementById("hidd");
  const content = document.getElementsByClassName("content")[0];
  const load = document.getElementsByClassName("loading")[0];

  // Check if elements were found (good for debugging)
  if (!enterText) console.error("Element with ID 'hidd' not found!");
  if (!content) console.error("Element with class 'content' not found!");
  if (!load) console.error("Element with class 'loading' not found!");

  // Initial Hiding
  if (content) content.style.display = "none";
  if (load) load.style.display = "none";

  function show(callback) {
      if (load) load.style.display = "block";
      setTimeout(() => {
          if (load) load.style.display = "none";
          if (typeof callback === 'function') callback();
      }, 3000);
  }

  function show1() {
      if (content) content.style.display = "block";
  }

  function hide(callback) {
      if (content) content.style.display = "none";
      if (enterText) enterText.style.display = "none"; // This should hide it
      if (load) load.style.display = "none";
      if (typeof callback === 'function') callback();
  }

  document.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
          hide(() => show(show1));
      }
  });
});


*/
































