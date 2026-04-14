import { Directive, effect, ElementRef, inject, input, Renderer2 } from "@angular/core";

@Directive({
  selector: '[appLoading]',
})
export class LoadingDirective {
  isLoading = input<boolean>(false, { alias: 'appLoading' });

  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);

  private overlay!: HTMLElement;

  constructor() {
    this.createOverlay();
    effect(() => this.toggleLoader(this.isLoading()));
  }

  private createOverlay() {
    const parent = this.el.nativeElement;

    this.renderer.setStyle(parent, 'position', 'relative');

    this.overlay = this.renderer.createElement('div');
    this.renderer.addClass(this.overlay, 'loader-overlay');

    this.overlay.innerHTML = this.getLoaderSvg();

    this.renderer.appendChild(parent, this.overlay);
    this.renderer.setStyle(this.overlay, 'display', 'none');
  }

  private toggleLoader(isLoading: boolean) {
    this.renderer.setStyle(this.overlay, 'display', isLoading ? 'flex' : 'none');
  }

  private getLoaderSvg(): string {
    return `
      <div class="loader">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="gradientMove" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#191D3F">
                <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stop-color="#612233">
                <animate attributeName="offset" values="1;2" dur="2s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>

          <path class="path"
            d="M0,500C0,224.3,224.3,0,500,0c275.7,0,500,224.3,500,500s-224.3,500-500,500
            C224.3,1000,0,775.7,0,500z"
          />

          <path class="center-shape"
            d="M500,212h-40.9v219v46.2v71.6h81.9v-71.6v-46.2V297.9
            c94.2,19,165.3,102.4,165.3,202.1c0,113.7-92.5,206.2-206.2,206.2
            S293.8,613.7,293.8,500h-81.9c0,158.8,129.2,288,288.1,288
            s288.1-129.2,288.1-288C788.1,341.2,658.8,212,500,212z"
          />
        </svg>
      </div>
    `;
  }
}
