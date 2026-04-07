import { Component, computed, input } from '@angular/core';

interface AnimatedWord {
  letters: string[];
  startIndex: number;
}

@Component({
  selector: 'app-animated-text',
  templateUrl: './animated-text.component.html',
  styleUrl: './animated-text.component.scss',
})
export class AnimatedTextComponent {
  text = input<string>('');

  words = computed<AnimatedWord[]>(() => {
    const raw = this.text().trim();
    if (!raw) {
      return [];
    }

    const split = raw.split(/\s+/).map(word => [...word]);
    let cursor = 0;

    return split.map(letters => {
      const word: AnimatedWord = {
        letters,
        startIndex: cursor,
      };
      cursor += letters.length;
      return word;
    });
  });
}
