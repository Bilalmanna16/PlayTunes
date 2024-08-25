let currrentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const roundedSeconds = Math.floor(seconds); // Round down to the nearest whole number
  const minutes = Math.floor(roundedSeconds / 60); // Calculate the minutes
  const remainingSeconds = roundedSeconds % 60; // Calculate the remaining seconds

  // Add leading zero to minutes and seconds if they are less than 10
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function fetchSongs(folder) {
  currFolder = folder;
  let songsFile = await fetch(`/${folder}/`);
  // let songsFile = await fetch(`songs/${folder}/`);
  let response = await songsFile.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${folder}`)[1].replaceAll("/", ""));
    }
  }

  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li> 
            <img src="assets/images/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ").replaceAll("/", "")} </div>
                <div>Harry</div>
            </div>
            <div class="playnow">
                <p>Play Now</p>
                <img src="assets/images/play.svg" alt="">
            </div>
        </li>`;
  }
  // attach an event Listener to each Song
  let listItem = Array.from(
    document.querySelector(".songList").querySelectorAll("li")
  );
  listItem.forEach((e) => {
    e.querySelectorAll("img")[1].addEventListener("click", (element) => {
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playmusic = (track, pause = false) => {
  // let audio = new Audio("songs/" + track)
  currrentSong.src = `${currFolder}/` + track;
  if (!pause) {
    currrentSong.play();
    play.src = "assets/images/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = `<p>${track
    .replaceAll("%20", " ")
    .replaceAll("/", "")}</p>`;
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let songsFile = await fetch(`/songs/`);
  let response = await songsFile.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      // get the meta dat of the folder
      let songsFile = await fetch(
        `songs/${folder}/info.json`
      );
      let response = await songsFile.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +=
        `<div data-folder="${folder}" class="card">
                        <img src="songs/${folder}/cover.jpg" alt="image">
                        <h2>${response.title}</h2>
                        <div class="textInCard">
                            <p>${response.description}</p>
                        </div>
                        <div class="play">
                            <i class="fa-solid fa-play"></i>
                        </div>
                    </div>`;
    }
  };

  // Load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await fetchSongs(`songs/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0])
    });
  });
}

async function main() {
  await fetchSongs("songs/ncs");
  playmusic(songs[0], true);

  // display all the albums
  displayAlbums();

  play.addEventListener("click", () => {
    if (currrentSong.paused) {
      currrentSong.play();
      play.src = "assets/images/pause.svg";
    } else {
      currrentSong.pause();
      play.src = "assets/images/play.svg";
    }
  });

  // listen for timeupdate event
  currrentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${formatTime(
      currrentSong.currentTime
    )} / ${formatTime(currrentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currrentSong.currentTime / currrentSong.duration) * 100 + "%";
  });

  // event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currrentSong.currentTime = (currrentSong.duration * percent) / 100;
  });

  // add an event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add an event listener to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  // add event listener to previous
  previous.addEventListener("click", () => {
    currrentSong.pause();
    let index = songs.indexOf(currrentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });

  // add event listener to next
  next.addEventListener("click", () => {
    currrentSong.pause();

    let index = songs.indexOf(currrentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    }
  });

  // add an event listener to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currrentSong.volume = parseInt(e.target.value) / 100;
      if(currrentSong.volume >0){
        document.querySelector(".volume>img").src=  document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
      }
    });

    // add event listener to volume
    document.querySelector('.volume img').addEventListener('click',e=>{
      if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg","mute.svg")
        currrentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
      }
      else{
        e.target.src = e.target.src.replace("mute.svg","volume.svg")
        currrentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
      }
    })

}

main();
