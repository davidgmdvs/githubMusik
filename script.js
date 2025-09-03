const clientId = "e3d519bf";
let tracks = [];
let index = 0;
let currentMood = "";
let currentGenre = "";
let isPlaying = false;
const player = document.getElementById("player");
const nowTitle = document.getElementById("nowTitle");
const nowArtist = document.getElementById("nowArtist");
const nowPlayingCover = document.getElementById("nowPlayingCover");
const playPauseBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("progressBar");
const progressContainer = document.getElementById("progressContainer");
const generatePlaylistBtn = document.getElementById("generatePlaylist");
const discoverTabBtn = document.getElementById("discoverTabBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Sistema de pestañas
function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    switchTab(tab.dataset.tab);
  });
});

// Event listeners para los chips de estado de ánimo
document.querySelectorAll('#moodChips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    setMood(chip.dataset.mood, chip);
  });
});

// Event listeners para los chips de género
document.querySelectorAll('#genreChips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    setGenre(chip.dataset.genre, chip);
  });
});

// Funciones para chips
function clearActive(group) {
  group.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
}

function setMood(mood, el) {
  currentMood = mood;
  clearActive(document.getElementById("moodChips"));
  el.classList.add("active");
}

function setGenre(genre, el) {
  currentGenre = genre;
  clearActive(document.getElementById("genreChips"));
  el.classList.add("active");
}

// Función para obtener música
async function fetchMusic() {
  index = 0;
  const limit = document.getElementById("limit").value;
  
  // Mostrar estado de carga
  const playlistElement = document.getElementById("playlistContainer");
  playlistElement.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Buscando música perfecta para ti...</p>
    </div>
  `;
  
  // Cambiar a la pestaña de playlist
  switchTab('playlist');

  try {
    let tags = "";
    if (currentMood) tags += currentMood;
    if (currentGenre) tags += (tags ? "," : "") + currentGenre;

    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&tags=${tags}&limit=${limit}`
    );
    const data = await response.json();

    if (data.results.length === 0) {
      playlistElement.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>No se encontraron canciones con esos filtros</p>
          <button class="btn btn-primary" id="tryAgainBtn">
            <i class="fas fa-undo"></i> Intentar con otros filtros
          </button>
        </div>
      `;
      document.getElementById("tryAgainBtn").addEventListener("click", () => switchTab('discover'));
      return;
    }

    tracks = data.results;
    renderPlaylist();
    playTrack(0);
  } catch (err) {
    console.error("Error:", err);
    playlistElement.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Ocurrió un error al conectar con el servicio de música</p>
        <button class="btn btn-primary" id="retryBtn">
          <i class="fas fa-redo"></i> Reintentar
        </button>
      </div>
    `;
    document.getElementById("retryBtn").addEventListener("click", fetchMusic);
  }
}

// Renderizar playlist
function renderPlaylist() {
  const playlist = document.getElementById("playlistContainer");
  playlist.innerHTML = "";
  
  if (tracks.length === 0) {
    playlist.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-music"></i>
        <p>Tu playlist está vacía</p>
        <button class="btn btn-primary" id="discoverBtn">
          <i class="fas fa-search"></i> Descubrir música
        </button>
      </div>
    `;
    document.getElementById("discoverBtn").addEventListener("click", () => switchTab('discover'));
    return;
  }
  
  tracks.forEach((track, i) => {
    const card = document.createElement("div");
    card.className = "track-card";
    if (i === index) card.classList.add("playing");
    card.addEventListener('click', () => playTrack(i));

    const cover = document.createElement("img");
    cover.src = track.image || "https://via.placeholder.com/60x60?text=♪";
    cover.className = "track-cover";

    const info = document.createElement("div");
    info.className = "track-info";
    info.innerHTML = `<p class="track-title">${track.name}</p>
                      <p class="track-artist">${track.artist_name}</p>`;

    const actions = document.createElement("div");
    actions.className = "track-actions";

    const likeBtn = document.createElement("button");
    likeBtn.innerHTML = "<i class='fas fa-heart'></i>";
    likeBtn.className = "icon-btn";
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      likeBtn.classList.toggle("liked");
    });

    const saveBtn = document.createElement("button");
    saveBtn.innerHTML = "<i class='fas fa-bookmark'></i>";
    saveBtn.className = "icon-btn";
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      saveBtn.classList.toggle("saved");
    });

    actions.appendChild(likeBtn);
    actions.appendChild(saveBtn);

    card.appendChild(cover);
    card.appendChild(info);
    card.appendChild(actions);

    playlist.appendChild(card);
  });
}

// Reproducir una pista
function playTrack(i) {
  index = i;
  player.src = tracks[index].audio;
  nowTitle.textContent = tracks[index].name;
  nowArtist.textContent = tracks[index].artist_name;
  nowPlayingCover.src = tracks[index].image || "https://via.placeholder.com/50x50?text=♪";
  
  // Actualizar la clase playing en las tarjetas
  document.querySelectorAll('.track-card').forEach((card, idx) => {
    if (idx === index) {
      card.classList.add('playing');
    } else {
      card.classList.remove('playing');
    }
  });
  
  player.play();
  isPlaying = true;
  playPauseBtn.innerHTML = "<i class='fas fa-pause'></i>";
}

// Alternar play/pause
function togglePlayPause() {
  if (player.paused) {
    player.play();
    playPauseBtn.innerHTML = "<i class='fas fa-pause'></i>";
    isPlaying = true;
  } else {
    player.pause();
    playPauseBtn.innerHTML = "<i class='fas fa-play'></i>";
    isPlaying = false;
  }
}

// Siguiente canción
function playNext() {
  if (index + 1 < tracks.length) {
    playTrack(index + 1);
  }
}

// Canción anterior
function playPrevious() {
  if (index > 0) {
    playTrack(index - 1);
  }
}

// Buscar en la barra de progreso
function seek(event) {
  const width = progressContainer.clientWidth;
  const clickX = event.offsetX;
  const duration = player.duration;
  player.currentTime = (clickX / width) * duration;
}

// Actualizar barra de progreso
player.addEventListener('timeupdate', () => {
  const value = (player.currentTime / player.duration) * 100;
  progressBar.style.width = value + '%';
});

// Cuando termina una canción
player.addEventListener("ended", () => {
  if (index + 1 < tracks.length) {
    playTrack(index + 1);
  } else {
    isPlaying = false;
    playPauseBtn.innerHTML = "<i class='fas fa-play'></i>";
  }
});

// Sistema de temas
function setTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem("theme", mode);
  document.getElementById("themeToggle").innerHTML = mode === "dark" ? "<i class='fas fa-sun'></i>" : "<i class='fas fa-moon'></i>";
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) {
    setTheme(saved);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

// Event listeners
generatePlaylistBtn.addEventListener("click", fetchMusic);
discoverTabBtn && discoverTabBtn.addEventListener("click", () => switchTab('discover'));
playPauseBtn.addEventListener("click", togglePlayPause);
prevBtn.addEventListener("click", playPrevious);
nextBtn.addEventListener("click", playNext);
progressContainer.addEventListener("click", seek);
document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

// Inicializar
initTheme();