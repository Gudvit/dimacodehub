import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-blog-page',
  templateUrl: './blog-page.component.html',
  styleUrl: './blog-page.component.scss',
  imports: [HeaderComponent, FooterComponent],
})
export class BlogPageComponent {
}
