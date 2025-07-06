const questionText = document.getElementById('question-text');
const answerText = document.getElementById('answer-text');
const scoreText = document.getElementById('score');
const questionNumberText = document.getElementById('questionNumber');
const bestScoreText = document.getElementById('best-score');
const best = document.getElementById('best');
const retry = document.getElementById('retry');
const scoreSection = document.getElementById('score-section');
const scoreDisplay = document.getElementById('score-display');

const correctSound = new Audio('correct.mp3');
const incorrectSound = new Audio('incorrect.mp3');

let bestScore = localStorage.getItem('bestScore') || 0;
bestScoreText.textContent = bestScore;

retry.addEventListener('pointerdown', () => {
  retry.classList.add('is-hidden');
  initGame();
});

async function initGame() {
  const container = document.getElementById('map-container');
  container.innerHTML = '';

  const res = await fetch('map.svg');
  container.innerHTML = await res.text();
  await new Promise(resolve => requestAnimationFrame(resolve));

  svgPanZoom('#japan-map', {
    zoomEnabled: true,
    controlIconsEnabled: true,
    fit: true,
    center: true,
    customEventsHandler: svgPanZoom.mobileEventsHandler,
    dblClickZoomEnabled: false,
  });

  const all = Array.from(document.querySelectorAll('.prefecture'));
  let remaining = [...all];
  let target, score = 0;
  let questionNumber = 0;
  retry.classList.add('is-hidden');

  // 🎉 Animate fall-in effect
  all.forEach((el, i) => {
    el.classList.remove('animate-in'); // reset if replayed
    setTimeout(() => {
      el.classList.add('animate-in');
    }, i * 20); // staggered delay
  });

  function updateScore() {
    scoreText.textContent = score + "/" + questionNumber;
  }

  function checkBestScore() {
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('bestScore', bestScore);
      bestScoreText.textContent = bestScore;
    }
  }

  function pick() {
    if (remaining.length === 0) {
      questionText.textContent = '🎉 Game over!';
      answerText.textContent = `Final Score: ${score}/${all.length}`;
      checkBestScore();
      retry.classList.remove('is-hidden');
      return;
    }

    const index = Math.floor(Math.random() * remaining.length);
    target = remaining.splice(index, 1)[0];
    questionText.textContent = `${target.id}`;
  }

  let selectedPrefecture = null;

  all.forEach(el => {
    let moved = false;

    const handleInteraction = () => {
      if (!target) return;

      if (selectedPrefecture !== el) {
        if (selectedPrefecture) {
          selectedPrefecture.classList.remove('is-highlighted');
        }
        selectedPrefecture = el;
        el.classList.add('is-highlighted');
        answerText.innerText = `Tap again to confirm`;
        return;
      }

      questionNumber++;
      if (el === target) {
        score++;
        answerText.innerText = "✅ Correct!";
        correctSound.play();
        selectedPrefecture.classList.remove('is-highlighted');
        target.classList.add('is-correct');
      } else {
        answerText.innerText = `❌ Incorrect! That was ${el.id}`;
        incorrectSound.play();
        selectedPrefecture.classList.remove('is-highlighted');
        target.classList.add('is-incorrect');
      }

      selectedPrefecture = null;
      updateScore();
      pick();
    };

    el.addEventListener('pointerdown', handleInteraction);
    el.addEventListener('touchstart', () => { moved = false; }, { passive: true });
    el.addEventListener('touchmove', () => { moved = true; }, { passive: true });
    el.addEventListener('touchend', (e) => {
      if (moved) return;
      e.preventDefault();
      handleInteraction();
    });
  });

  updateScore();
  pick();
}

initGame();