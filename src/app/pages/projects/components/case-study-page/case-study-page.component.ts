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
import { trackHeadings } from "../../../../navigation/heading-tracker";
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

  /**
   * "What I did" as lists: each area under its subheading, and runs of loose items as a list
   * without one.
   */
  readonly work = computed(() => {
    const groups: { title?: string; items: string[] }[] = [];
    for (const item of this.study()?.contributions ?? []) {
      if (typeof item !== "string") {
        groups.push({ title: item.title, items: [...item.items] });
      } else if (groups.length && groups[groups.length - 1].title === undefined) {
        groups[groups.length - 1].items.push(item);
      } else {
        groups.push({ items: [item] });
      }
    }
    return groups;
  });

  /** The sections the page has, in order: the headings and the "On this page" list. */
  readonly toc = computed(() => {
    const study = this.study();
    if (!study) {
      return [];
    }
    return [
      ...(study.task?.length ? [{ id: "task", text: "Task" }] : []),
      { id: "what-i-did", text: "What I did" },
      { id: "result", text: "Result" },
      ...(study.lessons?.length ? [{ id: "lessons", text: "What I'd do differently" }] : []),
    ];
  });

  private readonly headings = trackHeadings(".post-content__heading[id]");

  /** The heading the reader is in, highlighted in the contents list. */
  readonly activeId = this.headings.activeId;

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

  scrollToHeading(id: string): void {
    this.headings.scrollTo(id);
  }
}
