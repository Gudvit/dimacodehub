import { Component, EventEmitter, Output } from "@angular/core";
import { HeaderComponent } from "../../../../components/header/header.component";

@Component({
  selector: "app-home-hero-section",
  templateUrl: "./home-hero-section.component.html",
  styleUrl: "./home-hero-section.component.scss",
  imports: [HeaderComponent],
})
export class HomeHeroSectionComponent {
  @Output() scrollNext = new EventEmitter<void>();
  @Output() scrollToContacts = new EventEmitter<void>();

  onScrollNext(): void {
    this.scrollNext.emit();
  }

  onScrollToContacts(): void {
    this.scrollToContacts.emit();
  }
}
