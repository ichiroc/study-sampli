import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";

export class WakeLockController extends Controller {
  static targets = ["toggle", "knob", "banner", "errorMsg"];

  connect() {
    this.wakeLock = null;
    this.enabled = false;
    this._handleVisibilityChange = this._onVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this._handleVisibilityChange);
  }

  disconnect() {
    document.removeEventListener('visibilitychange', this._handleVisibilityChange);
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
    }
  }

  async toggle() {
    if (this.enabled) {
      await this._release();
    } else {
      await this._request();
    }
  }

  async resume() {
    this.bannerTarget.classList.add('hidden');
    await this._request();
  }

  async _request() {
    if (!('wakeLock' in navigator)) {
      this._showError('お使いの環境ではスリープ防止機能を利用できません');
      return;
    }
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.enabled = true;
      this.errorMsgTarget.classList.add('hidden');
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
        if (this.enabled) {
          this._showBanner();
        }
        this._updateUI();
      });
      this._updateUI();
    } catch (err) {
      this.enabled = false;
      let msg = 'スリープ防止の取得に失敗しました';
      if (err.name === 'NotAllowedError') {
        msg = '低電力モードをOFFにするか、画面の自動ロック設定をご確認ください';
      }
      this._showError(msg);
      this._updateUI();
    }
  }

  async _release() {
    this.enabled = false;
    if (this.wakeLock) {
      await this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
    this.bannerTarget.classList.add('hidden');
    this.errorMsgTarget.classList.add('hidden');
    this._updateUI();
  }

  _onVisibilityChange() {
    if (document.visibilityState === 'visible' && this.enabled && !this.wakeLock) {
      this._showBanner();
    }
  }

  _showBanner() {
    this.bannerTarget.classList.remove('hidden');
  }

  _showError(msg) {
    this.errorMsgTarget.textContent = msg;
    this.errorMsgTarget.classList.remove('hidden');
  }

  _updateUI() {
    const isActive = this.enabled && this.wakeLock !== null;
    this.toggleTarget.setAttribute('aria-checked', String(isActive));
    if (isActive) {
      this.toggleTarget.classList.remove('bg-gray-300');
      this.toggleTarget.classList.add('bg-[#18A8E4]');
      this.knobTarget.classList.remove('translate-x-1');
      this.knobTarget.classList.add('translate-x-[28px]');
    } else {
      this.toggleTarget.classList.remove('bg-[#18A8E4]');
      this.toggleTarget.classList.add('bg-gray-300');
      this.knobTarget.classList.remove('translate-x-[28px]');
      this.knobTarget.classList.add('translate-x-1');
    }
  }
}
