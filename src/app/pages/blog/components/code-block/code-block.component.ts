import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { highlight } from "../../code/highlight";
import type { CodeBlock } from "../../models/blog-post.model";

/** A code block in a post, highlighted into spans — the source is never parsed as HTML. */
@Component({
  selector: "app-code-block",
  templateUrl: "./code-block.component.html",
  styleUrl: "./code-block.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlockComponent {
  readonly block = input.required<CodeBlock>();

  readonly tokens = computed(() => highlight(this.block().source, this.block().language));
}
