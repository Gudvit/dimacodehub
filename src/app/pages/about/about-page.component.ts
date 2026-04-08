import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AnimatedTextComponent } from "../../components/animated-text/animated-text.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-about-page",
  templateUrl: "./about-page.component.html",
  styleUrl: "./about-page.component.scss",
  imports: [
    HeaderComponent,
    FooterComponent,
    AnimatedTextComponent,
  ],
})
export class AboutPageComponent {}
