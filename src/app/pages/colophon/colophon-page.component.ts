import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { syncPageMeta } from "../../seo/page-meta";
import { BUILD_STATS_FILE, type BuildStats, formatKilobytes } from "./build-stats";
import { ADRS, PERFORMANCE, PIPELINE, REPOSITORY_URL, STACK } from "./colophon";

@Component({
  selector: "app-colophon-page",
  templateUrl: "./colophon-page.component.html",
  styleUrl: "./colophon-page.component.scss",
  imports: [HeaderComponent, FooterComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColophonPageComponent {
  readonly stack = STACK;
  readonly adrs = ADRS;
  readonly pipeline = PIPELINE;
  readonly performance = PERFORMANCE;
  readonly repositoryUrl = REPOSITORY_URL;
  readonly adrUrl = (file: string) => `${REPOSITORY_URL}/blob/main/docs/architecture/${file}`;

  /** `undefined` while loading, `null` when the build left no numbers (the dev server). */
  readonly stats = signal<BuildStats | null | undefined>(undefined);
  readonly figures = computed(() => {
    const stats = this.stats();
    return (
      stats && [
        { value: formatKilobytes(stats.initialJs), label: "JavaScript on first load, gzipped" },
        { value: formatKilobytes(stats.initialCss), label: "global CSS, gzipped" },
        {
          value: formatKilobytes(stats.lazyJs),
          label: `loaded on demand, in ${stats.lazyChunks} chunks`,
        },
        { value: String(stats.prerenderedPages), label: "pages prerendered" },
        { value: String(stats.unitTests), label: "unit and component tests" },
        { value: String(stats.e2eTests), label: "end-to-end scenarios" },
      ]
    );
  });
  readonly commitUrl = computed(() => {
    const commit = this.stats()?.commit;
    return commit ? `${REPOSITORY_URL}/commit/${commit}` : null;
  });

  constructor() {
    syncPageMeta(() => ({
      title: "How this site is built",
      description:
        "The architecture, decisions, quality gates and measured weight behind this portfolio — an Angular site held to the standards of a production codebase.",
    }));

    // The numbers belong to the deployment, not to the code: the build measures them and
    // the page reads them where it runs. Relative, so the base href applies.
    afterNextRender(() => {
      fetch(BUILD_STATS_FILE)
        .then((response) => (response.ok ? (response.json() as Promise<BuildStats>) : null))
        .catch(() => null)
        .then((stats) => this.stats.set(stats));
    });
  }
}
