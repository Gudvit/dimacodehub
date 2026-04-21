import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { map } from 'rxjs';
import { HeaderComponent } from '../../../../components/header/header.component';
import { FooterComponent } from '../../../../components/footer/footer.component';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blog-post-page',
  templateUrl: './blog-post-page.component.html',
  styleUrl: './blog-post-page.component.scss',
  imports: [HeaderComponent, FooterComponent, RouterLink, DatePipe],
})
export class BlogPostPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly blogService = inject(BlogService);

  private readonly slug = toSignal(
    this.route.params.pipe(map((p) => p['slug'] as string)),
  );

  readonly post = computed(() => {
    const slug = this.slug();
    return slug ? this.blogService.getBySlug(slug) : undefined;
  });
}
