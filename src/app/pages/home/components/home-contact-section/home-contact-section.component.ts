import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  output,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { FooterComponent } from "../../../../components/footer/footer.component";
import { ContactFormService } from "./contact-form.service";

// The only place the contact details are written down. The template binds to them; the
// e2e specs assert what the template renders, so a change here cannot pass unnoticed.
const CONTACT_EMAIL = "gudvitt@gmail.com";
const CONTACT_PHONE = "+48 577 68 22 99";

type SendStatus = "idle" | "sending" | "sent" | "error";

@Component({
  selector: "app-home-contact-section",
  templateUrl: "./home-contact-section.component.html",
  styleUrl: "./home-contact-section.component.scss",
  imports: [FooterComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeContactSectionComponent {
  readonly backToTop = output<void>();

  private readonly contact = inject(ContactFormService);
  private readonly fb = inject(FormBuilder);
  private readonly inFlight = new AbortController();

  readonly status = signal<SendStatus>("idle");
  readonly sending = computed(() => this.status() === "sending");
  readonly sent = computed(() => this.status() === "sent");
  readonly failed = computed(() => this.status() === "error");

  readonly form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    email: ["", [Validators.required, Validators.email]],
    message: ["", [Validators.required, Validators.minLength(10)]],
    botcheck: [false],
  });

  readonly contactEmail = CONTACT_EMAIL;
  readonly emailHref = `mailto:${CONTACT_EMAIL}`;

  readonly contactPhone = CONTACT_PHONE;
  readonly phoneHref = `tel:${CONTACT_PHONE.replace(/\s/g, "")}`;

  readonly mailtoHref =
    `mailto:${CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent("Project inquiry")}` +
    `&body=${encodeURIComponent("Hi Dmytro,\n\n")}`;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.inFlight.abort());
  }

  async submit(): Promise<void> {
    if (this.sending()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set("sending");
    this.form.disable();

    try {
      await this.contact.send(this.form.getRawValue(), this.inFlight.signal);
      this.status.set("sent");
      this.form.reset();
    } catch (error) {
      // Aborted from DestroyRef: the component is gone, there is no one left to tell.
      if (this.inFlight.signal.aborted) {
        return;
      }

      console.error("Contact form: send failed.", error);
      this.status.set("error");
    } finally {
      this.form.enable();
    }
  }

  writeAnother(): void {
    this.status.set("idle");
  }

  showsError(control: "name" | "email" | "message"): boolean {
    const field = this.form.controls[control];
    return field.touched && field.invalid;
  }
}
