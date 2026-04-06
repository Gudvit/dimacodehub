import { AfterViewInit, ChangeDetectorRef, Component, computed, effect, input } from '@angular/core';

@Component({
  selector: 'app-animated-text',
  standalone: true,
  template: `
    <span class="text" [class.is-ready]="isReady">
      @for (word of words(); track $index; let wi = $index) {
        <span class="word">
          @for (letter of word; track $index; let li = $index) {
            <span
              class="letter"
              [style.--i]="li"
              [style.--word-delay.s]="wordDelays()[wi]"
              [style.--duration.s]="duration()"
              [style.--delay.s]="stagger()">
              {{ letter }}
            </span>
          }

          @if (wi < words().length - 1) {
            <span class="space">&nbsp;</span>
          }
        </span>
      }
    </span>
  `,
  styleUrl: './animated-text.component.scss',
})
export class AnimatedTextComponent implements AfterViewInit {
  isReady = false;

  text = input<string>('');
  stagger = input(0.05);
  duration = input(0.7);
  wordPause = input(0.25);

  words = computed(() =>
    this.text()
      .trim()
      .split(/\s+/)
      .map(word => [...word])
  );

  wordDelays = computed(() => {
    const pause = Math.max(0, this.wordPause());
    let time = 0;

    return this.words().map(word => {
      const start = time;
      time += word.length * this.stagger() + pause;
      return start;
    });
  });

  constructor(private readonly cdr: ChangeDetectorRef) {
    effect(() => {
      this.text();
      this.isReady = false;
      queueMicrotask(() => {
        this.isReady = true;
        this.cdr.markForCheck();
      });
    });
  }

  ngAfterViewInit(): void {
    this.isReady = true;
    this.cdr.detectChanges();
  }
}
