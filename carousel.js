class StackCarousel {
  constructor(el, images) {
    this.el = el;
    this.images = images;
    this.N = 4;
    this.current = 0;
    this.pool = [];
    this.busy = false;
    this.live = false;
    this.py = 0;
    this.dy = 0;
    this._build();
    this._listen();
  }

  _build() {
    for (let i = this.N - 1; i >= 0; i--) {
      const div = document.createElement('div');
      div.className = 'card';
      const img = document.createElement('img');
      img.src = this.images[i % this.images.length];
      img.alt = '';
      div.appendChild(img);
      this.el.appendChild(div);
      this.pool.unshift(div);
    }
    this.pool.forEach((c, i) => (c.dataset.pos = i));
  }

  _src(card, idx) {
    const len = this.images.length;
    card.querySelector('img').src = this.images[((idx % len) + len) % len];
  }

  next() {
    if (this.busy) return;
    this.busy = true;

    const front = this.pool[0];
    front.dataset.pos = 'exit';
    for (let i = 1; i < this.N; i++) this.pool[i].dataset.pos = i - 1;

    setTimeout(() => {
      this.current = (this.current + 1) % this.images.length;
      this._src(front, this.current + this.N - 1);
      this.pool.push(this.pool.shift());

      const back = this.pool[this.N - 1];
      back.style.transition = 'none';
      back.dataset.pos = String(this.N - 1);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        back.style.transition = '';
        this.busy = false;
      }));
    }, 560);
  }

  prev() {
    if (this.busy) return;
    this.busy = true;

    this.current = (this.current - 1 + this.images.length) % this.images.length;

    const back = this.pool[this.N - 1];
    this._src(back, this.current);
    for (let i = 0; i < this.N - 1; i++) this.pool[i].dataset.pos = i + 1;

    back.style.transition = 'none';
    back.dataset.pos = 'entry';
    this.pool.unshift(this.pool.pop());

    requestAnimationFrame(() => requestAnimationFrame(() => {
      back.style.transition = '';
      back.dataset.pos = '0';
      setTimeout(() => (this.busy = false), 560);
    }));
  }

  _listen() {
    const el = this.el;

    el.addEventListener('pointerdown', e => {
      if (this.busy) return;
      this.live = true;
      this.py = e.clientY;
      this.dy = 0;
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    el.addEventListener('pointermove', e => {
      if (!this.live) return;
      this.dy = e.clientY - this.py;
      const f = this.pool[0];
      f.style.transition = 'none';
      f.style.transform = `translate(0, ${this.dy}px) rotate(${this.dy * 0.02}deg)`;
    });

    const release = () => {
      if (!this.live) return;
      this.live = false;
      const f = this.pool[0];
      f.style.transition = '';
      f.style.transform = '';
      if (this.dy < -60) this.next();
      else if (this.dy > 60) this.prev();
    };

    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
  }
}

// ── Image sets (6 images each, different subjects per carousel) ──
const SETS = [
  ['alpine1','alpine2','alpine3','alpine4','alpine5','alpine6'],
  ['ocean7','ocean8','ocean9','ocean10','ocean11','ocean12'],
  ['city13','city14','city15','city16','city17','city18'],
  ['forest19','forest20','forest21','forest22','forest23','forest24'],
].map(seeds => seeds.map(s => `https://picsum.photos/seed/${s}/400/560`));

document.querySelectorAll('.carousel-wrapper').forEach((el, i) => {
  new StackCarousel(el, SETS[i]);
});
