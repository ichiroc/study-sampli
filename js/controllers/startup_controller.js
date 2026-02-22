import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";

export class StartupController extends Controller {
  static targets = ["overlay"];

  async start() {
    this.overlayTarget.classList.add('hidden');

    // focus は await より前に呼ぶ（iOS はユーザージェスチャーの同期コンテキスト内でないと無視する）
    const keyCapture = this.element.querySelector('[data-count-target="keyCapture"]');
    if (keyCapture) keyCapture.focus();

    const wl = this.application.getControllerForElementAndIdentifier(this.element, 'wakelock');
    if (wl) await wl._request();
  }
}
