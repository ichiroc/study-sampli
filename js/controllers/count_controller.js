import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";

export class CountController extends Controller {
  static targets = ["count", "prevCount", "streakDays", "streakSub", "topBadge", "goalBadge", "button", "keyCapture"];
  static STORAGE_KEY = "studySampli";
  static GOAL_KEY = "studySampli_goal";
  static DEFAULT_GOAL = 20;

  #readGoal() {
    const val = parseInt(localStorage.getItem(CountController.GOAL_KEY), 10);
    return isNaN(val) || val < 1 ? CountController.DEFAULT_GOAL : val;
  }

  #writeGoal(val) {
    localStorage.setItem(CountController.GOAL_KEY, String(val));
  }

  #getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  #readStorage() {
    try {
      return JSON.parse(localStorage.getItem(CountController.STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  #writeStorage(data) {
    localStorage.setItem(CountController.STORAGE_KEY, JSON.stringify(data));
  }

  #calcStreak(data, today) {
    const todayCount = data[today] || 0;
    let streak = 0;

    const startOffset = todayCount > 0 ? 0 : 1;

    for (let i = startOffset; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if ((data[key] || 0) > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  connect() {
    this.render();
    this._bindKeyCapture = () => {
      if (!this.streakSubTarget.querySelector('input')) {
        this.keyCaptureTarget.focus();
      }
    };
    document.addEventListener('touchend', this._bindKeyCapture, { passive: true });
  }

  disconnect() {
    document.removeEventListener('touchend', this._bindKeyCapture);
  }

  push() {
    const data = this.#readStorage();
    const today = this.#getToday();
    const prevKey = Object.keys(data).filter(k => k < today).sort().at(-1);
    const prevCount = prevKey ? data[prevKey] : 0;
    data[today] = (data[today] || 0) + 1;
    this.#writeStorage(data);
    if (prevCount > 0 && data[today] === prevCount + 1) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    }
    if (data[today] === this.#readGoal()) {
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: ['#FFD700', '#FF69B4', '#00CED1', '#7CFC00', '#FF6347'] });
    }
    this.render();
  }

  editGoal() {
    const span = this.streakSubTarget;
    if (span.querySelector('input')) return;

    const goal = this.#readGoal();
    span.textContent = '';

    const label = document.createElement('span');
    label.textContent = '目標 ';

    const input = document.createElement('input');
    input.type = 'number';
    input.inputMode = 'numeric';
    input.value = goal;
    input.min = 1;
    input.max = 999;
    input.className = 'w-12 text-xs text-center border-b border-[#496182] bg-transparent outline-none text-[#496182]';

    const unit = document.createElement('span');
    unit.textContent = ' 問';

    span.appendChild(label);
    span.appendChild(input);
    span.appendChild(unit);
    input.focus();
    input.select();

    const commit = () => {
      const val = parseInt(input.value, 10);
      if (!isNaN(val) && val >= 1 && val <= 999) {
        this.#writeGoal(val);
      }
      this.render();
      this.keyCaptureTarget.focus();
    };

    input.addEventListener('blur', commit, { once: true });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.removeEventListener('blur', commit); this.render(); }
    });
  }

  render() {
    const data = this.#readStorage();
    const today = this.#getToday();
    const todayCount = data[today] || 0;
    const prevKey = Object.keys(data).filter(k => k < today).sort().at(-1);
    const prevCount = prevKey ? data[prevKey] : 0;
    const streak = this.#calcStreak(data, today);
    const goal = this.#readGoal();
    const remaining = Math.max(0, goal - todayCount);

    this.countTarget.textContent = todayCount;
    this.prevCountTarget.textContent = prevCount;
    this.streakDaysTarget.textContent = `連続 ${streak}日`;
    this.streakSubTarget.textContent =
      remaining === 0 ? "今日の目標達成！" : `目標まであと${remaining}問`;
    const exceeded = prevCount > 0 && todayCount > prevCount;
    const goalReached = remaining === 0;
    this.topBadgeTarget.classList.toggle("hidden", !exceeded);
    this.goalBadgeTarget.classList.toggle("hidden", !goalReached);
    this.buttonTarget.classList.toggle("bg-[#18A8E4]", !exceeded);
    this.buttonTarget.classList.toggle("bg-red-500", exceeded);
  }
}
