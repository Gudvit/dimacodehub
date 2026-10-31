import { Injectable, signal } from "@angular/core";

/**
 * Whether the command palette is open. Separate from the palette itself, which is a deferred
 * chunk: the header's button can ask for it before the chunk has arrived.
 */
@Injectable({ providedIn: "root" })
export class CommandPaletteService {
  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((open) => !open);
  }
}
