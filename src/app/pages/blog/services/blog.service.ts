import { Injectable } from '@angular/core';
import { BlogPost } from '../models/blog-post.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly posts: BlogPost[] = [
    {
      slug: 'ai-frontend-engineering',
      title: 'What AI Actually Changes About Frontend Engineering',
      date: '2026-04-22',
      tags: ['AI', 'Frontend', 'UX', 'Architecture'],
      preview:
        "AI features aren't a new category of problem — they're existing frontend problems under new pressure. Here's what actually changes when you add an LLM to a production UI.",
      readingTime: 6,
      sections: [
        {
          paragraphs: [
            "I've been integrating AI features into frontend products for over a year now. Chat interfaces, inline suggestions, semantic search, summarization flows. And the most consistent observation I can share is this: AI doesn't introduce fundamentally new engineering problems. It takes the problems you already have — async state, error handling, loading UX, perceived performance — and makes them harder to ignore.",
            "Here's what I've actually had to rethink when building for AI.",
          ],
        },
        {
          heading: 'Streaming changes everything about loading states',
          paragraphs: [
            "Most AI responses are streamed. The server sends tokens incrementally over a long-lived connection, and your UI needs to reflect that in real time. This breaks the standard request/response mental model that most frontend code is built around.",
            "The naive approach — wait for the full response, then render — feels broken to users. A 3-second blank wait followed by a wall of text is far worse than text appearing word by word, even if the total latency is identical. Streaming makes latency feel interactive rather than blocking.",
            "Implementing this well in Angular means thinking about SSE (Server-Sent Events) or WebSocket streams, managing a signal or BehaviorSubject that updates as chunks arrive, and rendering incrementally. The tricky part is that you're essentially building a live, append-only document — and you need to handle mid-stream errors, unexpected stream closures, and markdown that renders correctly even when partially received.",
          ],
        },
        {
          heading: 'Error handling is more visible than ever',
          paragraphs: [
            "In a standard API call, an error is binary: the request either succeeds or fails. With AI, there's a spectrum. The model might produce a response that is technically valid but completely wrong for the user's intent. The stream might cut off halfway. The model might refuse to answer. Rate limits might kick in after several successful requests.",
            "All of these need distinct UI handling. A mid-stream failure should show what was generated so far, not discard it. A refusal should be surfaced clearly, not silently replaced with an empty state. Rate limit errors need a user-facing message, not a raw HTTP 429.",
            "The discipline required here is the same discipline good error handling always demands — explicit states, not implicit ones. But AI makes bad error handling immediately painful in a way that a standard REST endpoint rarely does.",
          ],
        },
        {
          heading: 'Perceived performance matters more than actual performance',
          paragraphs: [
            "LLM inference is slow. First-token latency is often 500ms–2s even for fast providers. This is a UX constraint you can't engineer away — you can only design around it.",
            "What I've found most effective: show something within 200ms of the user action, always. That something might be a skeleton, a 'thinking' indicator, or the beginning of a response. The exact content matters less than the signal that the system acknowledged the request and is working.",
            "The psychological research on this is clear: perceived wait time is a function of feedback, not elapsed time. Users tolerate 3-second waits with good feedback far better than 1-second waits with none.",
          ],
        },
        {
          heading: 'Where does AI logic actually belong?',
          paragraphs: [
            "A question I get asked often: should prompt construction live in the frontend or the backend? My answer is almost always the backend — and here's why.",
            "Prompts contain your product logic. They encode how your product interprets user input, what context it provides the model, what constraints it enforces. Exposing that in client-side code means exposing it to users. It also means every prompt change requires a frontend deploy.",
            "The frontend's job is to collect user input cleanly, stream and render the response, and handle states. The backend's job is to own the model interaction. This boundary is clean and survives well as AI capabilities change — you can swap models, tweak prompts, add RAG context, all without touching the UI.",
          ],
        },
        {
          heading: "What hasn't changed",
          paragraphs: [
            "The fundamentals don't change. Good component boundaries, clean state management, explicit error states, accessible UI — all of this matters exactly as much as it did before AI entered the picture.",
            "If anything, AI features raise the bar on engineering quality because the failure modes are more visible. A poorly handled loading state in a standard form is annoying. The same in an AI chat interface feels broken. The margin for 'good enough' gets thinner.",
            "The engineers who will do this well aren't the ones who know the most about LLMs. They're the ones who already cared about UX detail, state correctness, and the craft of building interfaces that feel solid. AI just gives them a new surface to apply that craft.",
          ],
        },
      ],
    },
    {
      slug: 'angular-architecture-patterns',
      title: 'Angular Architecture Patterns I Use in Production',
      date: '2024-03-15',
      tags: ['Angular', 'Architecture', 'NgRx'],
      preview:
        "After years of building Angular applications for tens of thousands of users, I've learned that good architecture is invisible — it's what lets a team move fast without breaking things.",
      readingTime: 7,
      sections: [
        {
          paragraphs: [
            "I've spent most of my career working on Angular products that grew beyond what anyone initially planned for. A CRM used across Europe. A healthcare platform with 50K+ active users. Products where the team doubled and the feature scope tripled over two years.",
            'What I\'ve found is that the architectural decisions you make in the first few months tend to live with you for years. This post is about the patterns I\'ve settled on — not because they\'re theoretically elegant, but because they\'ve proven themselves under real-world load.',
          ],
        },
        {
          heading: 'Keep your components dumb',
          paragraphs: [
            'The single highest-leverage rule in any Angular codebase: push as much logic as possible out of your components. Components should be thin — they accept inputs, emit outputs, and delegate everything else.',
            'This means no direct HTTP calls in components. No business logic. Minimal derived state. If a component is doing something complex, that complexity belongs in a service, a store selector, or a pure function.',
            'The payoff is testability. A component with zero injected services is trivially unit-tested. A component with three injected services and business logic scattered through its lifecycle hooks is a nightmare.',
          ],
        },
        {
          heading: 'State management is about boundaries',
          paragraphs: [
            'NgRx gets a reputation for being verbose, and it is. But the verbosity is doing real work — it forces you to make explicit decisions about what state lives where, who owns it, and how it changes.',
            "The mistake most teams make is putting everything in the store. Not every piece of state needs NgRx. Local UI state (is this dropdown open? which tab is selected?) belongs in the component. Server-fetched data that multiple features share belongs in the store.",
            "I use a simple rule: if two distinct feature modules need the same data, it goes in the store. If only one component needs it, keep it local. That boundary stays clear as the app grows.",
          ],
        },
        {
          heading: 'Feature modules vs standalone components',
          paragraphs: [
            'With Angular 14+ and the push toward standalone, I\'ve moved away from feature modules for new code. Standalone components are simpler to reason about — the dependency graph is explicit at the component level rather than hidden inside a module declaration.',
            "For existing NgModule-based codebases, I don't recommend a big-bang migration. Instead, introduce standalone components at the edges and work inward. Angular supports mixing both approaches.",
            "The bigger win from standalone isn't the syntax change — it's the improved lazy loading granularity. You can now lazy-load at the route level without creating a dedicated module just to hold one component.",
          ],
        },
        {
          heading: 'What I would do differently',
          paragraphs: [
            "If I were starting a large Angular project today, I'd invest heavily upfront in three things: a clear state management policy (document what goes in the store), a strict boundary between feature code and shared code, and E2E tests for every critical user flow before the first major release.",
            "The E2E tests especially. We added Playwright to a mature product and the confidence it gave the team to refactor was immediately visible in velocity. Don't wait until you're afraid to deploy.",
          ],
        },
      ],
    },
    {
      slug: 'state-management-production',
      title: 'State Management Patterns I Actually Use',
      date: '2024-02-08',
      tags: ['Angular', 'NgRx', 'State Management'],
      preview:
        "NgRx is powerful, but it's also easy to overcomplicate. After using it across multiple large-scale products, here's what I've distilled into practical patterns.",
      readingTime: 5,
      sections: [
        {
          paragraphs: [
            "State management is one of those topics where the gap between theory and practice is enormous. You can read all the Redux documentation and still build yourself a tangled mess once the app grows past a certain complexity.",
            "This is what I've learned after building NgRx-based frontends in production environments — the rules I follow, the patterns I've abandoned, and the questions I ask before adding new state.",
          ],
        },
        {
          heading: 'Not everything belongs in the store',
          paragraphs: [
            "The most common NgRx mistake I see in codebases is treating the store as a global variable dump. Every piece of data ends up there, regardless of whether it needs to be shared or persisted.",
            "I use a simple mental model: the store is for state that crosses feature boundaries or needs to survive navigation. Everything else stays local. A form's validation state, a tooltip's open/closed state, pagination UI — these are component concerns.",
            "When you keep the store lean, selectors stay fast, actions stay meaningful, and the DevTools timeline stays readable.",
          ],
        },
        {
          heading: 'Selectors as your API',
          paragraphs: [
            "Selectors are underutilized. Most teams write one selector per piece of raw state and then compute everything inline in the component. This is a mistake.",
            "Treat selectors as the public API of your state slice. If a component needs 'the list of active users sorted by last login', that computation belongs in a selector — not in a `computed()` or a template pipe. Selectors are memoized, composable, and independently testable.",
            "I've started defining selectors first, before writing any reducers, because they force me to think about what the consumer actually needs rather than what's convenient to store.",
          ],
        },
        {
          heading: 'Effect patterns that age well',
          paragraphs: [
            "Effects are where NgRx tends to sprawl. I've seen effects files grow to 600 lines with a dozen different side effects per action. That's a sign that the action granularity is wrong.",
            "One pattern that's helped: one effect per distinct side effect. Don't have a single effect that fires an API call, updates a loading state, handles errors, and dispatches a success action. Split those concerns. The boilerplate cost is low; the clarity benefit is high.",
            "Also: be careful with `exhaustMap` vs `switchMap` vs `concatMap`. Wrong choice here causes subtle bugs. I default to `switchMap` for queries (latest result wins) and `concatMap` for mutations (order matters).",
          ],
        },
        {
          heading: 'When to reach for something simpler',
          paragraphs: [
            "I've been on projects where the complexity of NgRx clearly outweighed the benefits. For smaller apps or feature areas where state is mostly server-driven with minimal local complexity, I now reach for Angular's own signals + a simple service instead.",
            "Signals (from Angular 16+) combined with a service that wraps HTTP calls cover a wide range of use cases without the boilerplate overhead of actions, reducers, and effects. I only introduce NgRx when I need its specific strengths: time-travel debugging, strict action log, or complex cross-feature state coordination.",
          ],
        },
      ],
    },
  ];

  getAll(): BlogPost[] {
    return this.posts;
  }

  getBySlug(slug: string): BlogPost | undefined {
    return this.posts.find((p) => p.slug === slug);
  }
}
