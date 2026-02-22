import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";

export class SoundController extends Controller {
  connect() {
    this.audio = new Audio('./correct.mp3');
  }

  play() {
    this.audio.currentTime = 0;
    this.audio.play().catch(() => {});
    // iOS では audio.play() がフォーカスを奪うことがあるため、ユーザージェスチャーの
    // コンテキスト内で即座に keyCapture へ再フォーカスする
    const keyCapture = this.element.querySelector('[data-count-target="keyCapture"]');
    const isEditingGoal = this.element.querySelector('[data-count-target="streakSub"] input');
    if (keyCapture && !isEditingGoal) {
      keyCapture.focus();
    }
  }
}
