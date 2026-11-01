import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { HeaderComponent } from "../../../../components/header/header.component";
import { FooterComponent } from "../../../../components/footer/footer.component";
import { syncPageMeta } from "../../../../seo/page-meta";
import { CaseStudyService } from "../../services/case-study.service";
import { SITE_URL, ogImagePath } from "../../../../site";

@Component({
  selector: "app-case-study-page",
  templateUrl: "./case-study-page.component.html",
  styleUrl: "./case-study-page.component.scss",
  imports: [HeaderComponent, FooterComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseStudyPageComponent {
  /** Bound from the `:slug` route param by `withComponentInputBinding()`. */
  readonly slug = input.required<string>();

  private readonly caseStudies = inject(CaseStudyService);

  readonly study = computed(() => this.caseStudies.getBySlug(this.slug()));

  /** The live site's address without the scheme, as the link text. */
  readonly siteHost = computed(() => {
    const site = this.study()?.site;
    return site ? new URL(site).host : "";
  });

  constructor() {
    syncPageMeta(() => {
      const study = this.study();
      return (
        study && {
          title: study.title,
          description: study.summary,
          image: SITE_URL + ogImagePath(`projects/${study.slug}`),
        }
      );
    });
  }
}
