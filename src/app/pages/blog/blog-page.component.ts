import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BlogService } from './services/blog.service';

@Component({
  selector: 'app-blog-page',
  templateUrl: './blog-page.component.html',
  styleUrl: './blog-page.component.scss',
  imports: [HeaderComponent, FooterComponent, RouterLink, DatePipe],
})
export class BlogPageComponent {
  private readonly blogService = inject(BlogService);
  readonly posts = this.blogService.getAll();
}
