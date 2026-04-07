import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { RouterLink } from "@angular/router";
import { AnimatedTextComponent } from "../../components/animated-text/animated-text.component";

@Component({
  selector: "app-home-page",
  templateUrl: "./home-page.component.html",
  styleUrl: "./home-page.component.scss",
  imports: [
    HeaderComponent,
    FooterComponent,
    RouterLink,
    AnimatedTextComponent,
  ],
})
export class HomePageComponent {}
