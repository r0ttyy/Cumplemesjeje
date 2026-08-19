document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTOS DE LA INTERFAZ ---
  const btnStart = document.getElementById('btnStart');
  const btnYes = document.getElementById('btnYes');
  const btnNo = document.getElementById('btnNo');
  const btnContinue3 = document.getElementById('btnContinue3');

  const screen1 = document.getElementById('screen-1');
  const screen2 = document.getElementById('screen-2');
  const screen3 = document.getElementById('screen-3');
  const screen4 = document.getElementById('screen-4');
  const screen5 = document.getElementById('screen-5');

  // CONTROLES DE MÚSICA
  const btnPlayPause = document.getElementById('btnPlayPause');
  const volumeSlider = document.getElementById('volumeSlider');

  // --- AUDIOS LOCALES ---
  const audioYupii = new Audio('yupii.mp3');
  const audioConfeti = new Audio('confeti.mp3');
  const audioMuejeje = new Audio('muejeje.mp3');
  
  // Música de fondo principal (New Soul)
  const audioMusica = new Audio('fondo.mp3');
  audioMusica.loop = true;      // Se repite en bucle infinitamente
  audioMusica.volume = 0.5;     // Volumen inicial al 50%
  audioMusica.preload = 'auto'; // Precargado para respuesta inmediata

  // --- SONIDO SUAVE DE BOTÓN (Web Audio API) ---
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioContext;

  function reproducirPopSuave() {
    try {
      if (!audioContext) {
        audioContext = new AudioCtx();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      const now = audioContext.currentTime;

      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.log("Error al reproducir sonido suave", e);
    }
  }

  // Sonido suave para cualquier interacción de botón o punto
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.classList.contains('dot')) {
      reproducirPopSuave();
    }
  });

  // --- CONTROLES DE MÚSICA FLOTANTES ---
  if (btnPlayPause && volumeSlider) {
    // Botón Pausa / Play
    btnPlayPause.addEventListener('click', () => {
      if (audioMusica.paused) {
        audioMusica.play().then(() => {
          btnPlayPause.textContent = '🎵';
        }).catch(e => console.log("Error al reproducir:", e));
      } else {
        audioMusica.pause();
        btnPlayPause.textContent = '⏸️';
      }
    });

    // Deslizador de volumen
    volumeSlider.addEventListener('input', (e) => {
      audioMusica.volume = e.target.value;
    });
  }

  // --- NAVEGACIÓN DE PANTALLAS ---

  // Pantalla 1 -> 2 (INICIA LA MÚSICA DE FONDO AL OPRIMIR EL BOTÓN)
  btnStart.addEventListener('click', () => {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Reproduce la canción al instante y actualiza icono
    audioMusica.play().then(() => {
      if (btnPlayPause) btnPlayPause.textContent = '🎵';
    }).catch(e => console.log("Error al reproducir música de fondo:", e));

    screen1.classList.add('hidden');
    screen2.classList.remove('hidden');
    screen2.classList.add('fade-in');
  });

  // Botón "No" escurridizo
  const moverBotonNo = () => {
    if (btnNo.parentElement !== document.body) {
      document.body.appendChild(btnNo);
    }

    btnNo.style.position = 'fixed';

    const btnWidth = btnNo.offsetWidth;
    const btnHeight = btnNo.offsetHeight;
    const margin = 20;

    const maxX = window.innerWidth - btnWidth - margin;
    const maxY = window.innerHeight - btnHeight - margin;

    const randomX = Math.max(margin, Math.floor(Math.random() * maxX));
    const randomY = Math.max(margin, Math.floor(Math.random() * maxY));

    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
  };

  btnNo.addEventListener('mouseover', moverBotonNo);
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moverBotonNo();
  });

  // Pantalla 2 -> 3 + Audios de celebración (Yupii + Confeti)
  btnYes.addEventListener('click', () => {
    if (btnNo) btnNo.remove();

    screen2.classList.add('hidden');
    screen3.classList.remove('hidden');
    screen3.classList.add('fade-in');

    audioYupii.currentTime = 0;
    audioConfeti.currentTime = 0;

    audioYupii.play().catch(e => console.log("Error Yupii:", e));
    audioConfeti.play().catch(e => console.log("Error Confeti:", e));

    lanzarConfeti();
  });

  // Pantalla 3 -> 4
  btnContinue3.addEventListener('click', () => {
    screen3.classList.add('hidden');
    screen4.classList.remove('hidden');
    screen4.classList.add('fade-in');
  });

  // --- LÓGICA DEL CARRUSEL (PANTALLA 4) ---
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dots = document.querySelectorAll('.dot');
  let currentIndex = 0;
  const totalSlides = dots.length;

  function updateCarousel(index) {
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Ocultar corazón izquierdo en la primera diapositiva
    if (currentIndex === 0) {
      prevBtn.classList.add('hidden-btn');
    } else {
      prevBtn.classList.remove('hidden-btn');
    }

    // Reproducir "muejeje.mp3" al llegar al segundo carrusel (índice 1)
    if (currentIndex === 1) {
      audioMuejeje.currentTime = 0;
      audioMuejeje.play().catch(e => console.log("Error Audio muejeje:", e));
    }

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // Inicializar estado del carrusel
  updateCarousel(0);

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < totalSlides - 1) {
        updateCarousel(currentIndex + 1);
      } else {
        // Al estar en la última diapositiva -> Pasar a Pantalla 5
        screen4.classList.add('hidden');
        screen5.classList.remove('hidden');
        screen5.classList.add('fade-in');
        lanzarConfeti();
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        updateCarousel(currentIndex - 1);
      }
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        updateCarousel(index);
      });
    });
  }

  // --- EFECTO CONFETI ---
  function lanzarConfeti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  }
});