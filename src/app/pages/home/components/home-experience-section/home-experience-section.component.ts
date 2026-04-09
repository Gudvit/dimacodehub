import { Component, computed, signal } from "@angular/core";

type ExperienceImpact = {
  label: string;
  value: string;
};

type ExperienceRole = {
  company: string;
  shortLabel: string;
  title: string;
  period: string;
  bullets: string[];
  impact: ExperienceImpact[];
};

@Component({
  selector: "app-home-experience-section",
  templateUrl: "./home-experience-section.component.html",
  styleUrl: "./home-experience-section.component.scss",
})
export class HomeExperienceSectionComponent {
  readonly roles: ExperienceRole[] = [
    {
      company: "Apomedical",
      shortLabel: "Now",
      title: "Senior Software Engineer",
      period: "Dec 2021 - Present",
      bullets: [
        "Owned frontend architecture for a business-critical Angular platform and set long-term technical direction.",
        "Designed scalable module boundaries and state strategy with NgRx/NGXS for different feature domains.",
        "Introduced Playwright E2E and covered critical user/payment flows to reduce production risk.",
        "Improved reliability and performance for a product used by tens of thousands of users across Europe.",
      ],
      impact: [
        { label: "Users", value: "50K+" },
        { label: "Modules", value: "5+" },
        { label: "Teams", value: "8" },
      ],
    },
    {
      company: "IdeaSoft",
      shortLabel: "Angular",
      title: "Angular Developer",
      period: "May 2019 - Dec 2021",
      bullets: [
        "Led frontend delivery of CRM products and acted as the technical owner for key UI decisions.",
        "Built predictable state management flows with NgRx for complex business scenarios.",
        "Worked directly with clients from Sweden and Israel, translating business requirements into stable solutions.",
        "Raised delivery quality through code standards, reviews, and clearer release processes.",
      ],
      impact: [
        { label: "Region", value: "EU" },
        { label: "Domain", value: "CRM" },
        { label: "Stack", value: "Angular + NgRx" },
      ],
    },
    {
      company: "Lazy Ants",
      shortLabel: "Lead JS",
      title: "Lead JS Developer",
      period: "Oct 2018 - Apr 2019",
      bullets: [
        "Owned code quality across projects and introduced consistent review practices for the team.",
        "Set up scalable frontend architecture with lazy loading and quality tooling (ESLint/Prettier/Compodoc).",
        "Improved performance bottlenecks and reduced UI-level regressions in active products.",
      ],
      impact: [
        { label: "Role", value: "Lead" },
        { label: "Focus", value: "Quality" },
        { label: "Outcome", value: "Perf Up" },
      ],
    },
    {
      company: "Lazy Ants",
      shortLabel: "MOBILE IONIC",
      title: "Ionic Developer",
      period: "Feb 2018 - Oct 2018",
      bullets: [
        "Built production mobile apps with Angular + Ionic and maintained delivery pace in tight timelines.",
        "Integrated third-party services: QR, YouTube API, PayPal, Google Maps API, Firebase Push.",
        "Implemented and stabilized multiple authentication flows across different user scenarios.",
      ],
      impact: [
        { label: "Platform", value: "Mobile" },
        { label: "Stack", value: "Ionic 3" },
        { label: "Integrations", value: "5+" },
      ],
    },
    {
      company: "Lazy Ants",
      shortLabel: "Angular",
      title: "Angular Developer",
      period: "Sep 2016 - Jan 2018",
      bullets: [
        "Developed Angular 2/4 applications with Angular CLI, TypeScript, and RxJS patterns.",
        "Structured features for maintainability and cleaner scaling as products evolved.",
        "Implemented E2E coverage with Protractor + Selenium for core user journeys.",
      ],
      impact: [
        { label: "Framework", value: "Angular 2/4" },
        { label: "Testing", value: "E2E" },
        { label: "Core", value: "RxJS" },
      ],
    },
    {
      company: "Lazy Ants",
      shortLabel: "Markup",
      title: "Markup Developer",
      period: "Nov 2014 - Sep 2016",
      bullets: [
        "Delivered responsive cross-browser UI layouts with solid HTML/CSS/SCSS fundamentals.",
        "Built UI interactions with JavaScript/jQuery and animation-driven UX behavior.",
        "Worked in team delivery workflows with Git and project management tooling.",
      ],
      impact: [
        { label: "Core", value: "HTML/CSS" },
        { label: "JS", value: "jQuery" },
        { label: "Workflow", value: "Git" },
      ],
    },
  ];

  readonly activeIndex = signal(0);
  readonly activeRole = computed(() => this.roles[this.activeIndex()]!);
  readonly panelKey = signal(0);

  setActive(index: number): void {
    if (index === this.activeIndex()) {
      return;
    }

    this.activeIndex.set(index);
    this.panelKey.update((value) => value + 1);
  }

  prevRole(): void {
    const nextIndex = this.activeIndex() > 0 ? this.activeIndex() - 1 : this.roles.length - 1;
    this.setActive(nextIndex);
  }

  nextRole(): void {
    const nextIndex = this.activeIndex() < this.roles.length - 1 ? this.activeIndex() + 1 : 0;
    this.setActive(nextIndex);
  }
}
