import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  isDevMode,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { LoaderComponent } from "../../../../components/loader/loader.component";
import { HeaderComponent } from "../../../../components/header/header.component";
import { FooterComponent } from "../../../../components/footer/footer.component";
import { syncPageMeta } from "../../../../seo/page-meta";
import { CaseStudyService } from "../../services/case-study.service";
import { SITE_URL, ogImagePath } from "../../../../site";

@Component({
  selector: "app-case-study-page",
  templateUrl: "./case-study-page.component.html",
  styleUrl: "./case-study-page.component.scss",
  imports: [HeaderComponent, FooterComponent, RouterLink, LoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseStudyPageComponent {
  /** Bound from the `:slug` route param by `withComponentInputBinding()`. */
  readonly slug = input.required<string>();

  /** `?draft` — on the dev server, the text of a case that is coming soon. */
  readonly draft = input<string>();

  private readonly caseStudies = inject(CaseStudyService);

  readonly study = computed(() => this.caseStudies.getBySlug(this.slug()));

  /** A case listed but not written up: the page shows the placeholder, not the draft. */
  readonly comingSoon = computed(
    () => !!this.study()?.comingSoon && !(isDevMode() && this.draft() !== undefined),
  );

  /** The live site's address without the scheme, as the link text: `t.me/KrakowEventsBot`. */
  readonly siteHost = computed(() => {
    const site = this.study()?.site;
    if (!site) {
      return "";
    }
    const url = new URL(site);
    return (url.host + url.pathname).replace(/\/$/, "");
  });

  constructor() {
    syncPageMeta(() => {
      const study = this.study();
      return (
        study &&
        (this.comingSoon()
          ? // No sharing card is made for it, and its summary may still be a placeholder.
            { title: study.title, description: study.tagline ?? study.title }
          : {
              title: study.title,
              description: study.summary,
              image: SITE_URL + ogImagePath(`projects/${study.slug}`),
            })
      );
    });
  }
}
