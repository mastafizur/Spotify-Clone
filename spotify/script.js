

let currentSong = new Audio();
let playButton = document.querySelector(".playButon");
let songinfobox = document.querySelector(".songinfobox");
let nextButton = document.querySelector(".nextbutton")
let previousButton = document.querySelector(".previousbutton")
let songs;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds to always have two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the formatted time string
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    let url = await fetch(`http://127.0.0.1:3000/spotify/${folder}/`)
    let response = await url.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // songs.push(decodeURI(element.href.replaceAll("http://127.0.0.1:3000/spotify/songs/", "")))
            songs.push(decodeURI(element.href))
            // songs.push(element.href.split("/songs/")[1])
        }
    }

    let songList = document.querySelector(".songList").querySelector("ul")
    songList.innerHTML = ""
    for (const song of songs) {
        songList.innerHTML = songList.innerHTML + `<li><img class="invert" src="music.svg" alt="">
        <div class="info">
            <div>${song}</div>
        </div>
        <div class="playNow"> 
            <span>Play Now</span>
            <img class="invert" src="playbuton.svg" alt="">
        </div>   
       </li>`
    }

    // Attatch an event listner to each song

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            playButton.src = "pause.svg"
            songinfobox.style.width = "200px"
        })
    })
    return songs;
}

const playMusic = (track) => {
    currentSong.src = track;
    currentSong.play();
    let songInfo = document.querySelector(".songinfo")
    if (track == undefined) {
        songInfo.innerHTML = ""
    } else {
        songInfo.innerHTML = track;
    }
    let songTime = document.querySelector(".songtime")
    songTime.innerHTML = "00:00/00:00";

}

async function displayArtists() {
    let url = await fetch(`http://127.0.0.1:3000/spotify/songs/Artists`)
    let response = await url.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a")
    let array = Array.from(anchor)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            let url = await fetch(`http://127.0.0.1:3000/spotify/songs/Artists/${folder}/info.json`)
            let response = await url.json();
            let artist = document.querySelector(".artist");
            artist.innerHTML = artist.innerHTML + ` <div data-folder="${response.title}" class="artist_Card">
            <div class="image">
                <img src="songs/Artists/${folder}/cover.jpg" alt="">
            </div>
            <p class="ArtistName">${response.title}</p>
            <p class="tag">${response.description}</p>
            <button class="playButton">
                <img src="playbutton.svg" alt="playbutton">
            </button>
        </div>`
        }
    }
    Array.from(document.getElementsByClassName("artist_Card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item)
            songs = await getSongs(`songs/Artists/${item.currentTarget.dataset.folder}`)
            // playMusic(songs[0]) 
            // playButton.src = "pause.svg"

        })
    })
}

async function displayAlbums() {
    let url = await fetch(`http://127.0.0.1:3000/spotify/songs/Albums`)
    let response = await url.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a")
    let array = Array.from(anchor)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            let url = await fetch(`http://127.0.0.1:3000/spotify/songs/Albums/${folder}/info.json`)
            let response = await url.json();
            let album = document.querySelector(".album");
            album.innerHTML = album.innerHTML + ` <div data-folder="${response.title}" class="albumCard">
            <div class="albumImage">
                <img src="songs/Albums/${folder}/cover.jpg" alt="">
            </div>
            <p class="albumSongText">${response.title}</p>
            <p class="albumSongArtist">${response.description}</p>
            <button class="playButton">
            <img src="playbutton.svg" alt="playbutton">
        </button>
        </div>`
        }
    }
    Array.from(document.getElementsByClassName("albumCard")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/Albums/${item.currentTarget.dataset.folder}`)
            // playMusic(songs[0])
            // playButton.src = "pause.svg"
            // window.location.href = `album.html`;
            loadPageContent = `album.html`;
        })
    })
}

async function main() {
    await getSongs("/songs/cs")
    songinfobox.style.width = "200px"
    // Show all songs in the playlist
    displayArtists();
    displayAlbums();

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".btn").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // attatch  event listner to the seekbar 
    // document.querySelector(".seekbar").addEventListener("click", e => {
    //     const rect = e.target.getBoundingClientRect();
    //     const offsetX = e.clientX - rect.left;
    //     const percentage = offsetX / e.target.offsetWidth;
    //     const newTime = percentage * currentSong.duration;
    //     currentSong.currentTime = newTime;
    //     document.querySelector(".btn").style.left = percentage * 100 + "%";
    // });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".btn").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })


    // Attatch a event listner to play, next and previous button

    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playButton.src = "pause.svg"
        } else {
            playButton.src = "playbuton.svg"
            currentSong.pause();
        }
    })

    playButton.addEventListener("keydown", () => {
        if (currentSong.paused) {
            currentSong.play();
            playButton.src = "pause.svg"
        } else {
            playButton.src = "playbuton.svg"
            currentSong.pause();
        }
    })

    // previousButton.addEventListener("click", () => {
    //     console.log(currentSong.src)
    //     let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    //     // let index1  = currentSong.src.split("/").slice(-1) [0]
    //     console.log(index+3)
    //     if ((index - 1) >= 0 ) {
    //         playMusic(songs[index - 1]);
    //         playButton.src = "pause.svg"
    //     }
    // })
    // nextButton.addEventListener("click", () => {
    //     console.log(currentSong.src)
    //     let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    //     if ((index + 1) < songs.length) {
    //         playMusic(songs[index + 1]);
    //         playButton.src = "pause.svg"
    //     }
    // })


    previousButton.addEventListener("click", () => {
        let currentSongName = decodeURI(currentSong.src);
        let index = songs.indexOf(currentSongName);
        if (index > 0) {
            let newIndex = index - 1;
            playMusic(songs[newIndex]);
            playButton.src = "pause.svg";
        }
    });

    nextButton.addEventListener("click", () => {
        let currentSongName = decodeURI(currentSong.src);
        let index = songs.indexOf(currentSongName);
        if (index < songs.length - 1) {
            let newIndex = index + 1;
            playMusic(songs[newIndex]);
            playButton.src = "pause.svg";
        }
    });


    // add eevent listne to volume

    document.querySelector(".volumeSongGrp").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    let volumeBtn = document.querySelector(".volumeSongGrp").getElementsByTagName("img")[0];
    volumeBtn.addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".volumeSongGrp").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.10;
            document.querySelector(".volumeSongGrp").getElementsByTagName("input")[0].value = 10;
        }
    })


}

main()
// module1.js