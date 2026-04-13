import { Component } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { FooterComponent } from "../../../../components/footer/footer.component";

@Component({
  selector: "app-home-contact-section",
  templateUrl: "./home-contact-section.component.html",
  styleUrl: "./home-contact-section.component.scss",
  imports: [ReactiveFormsModule, FooterComponent],
})
export class HomeContactSectionComponent {
  submitted = false;
  successMessage = "";

  readonly messageForm = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    email: ["", [Validators.required, Validators.email]],
    message: ["", [Validators.required, Validators.minLength(10)]],
  });

  constructor(private readonly fb: FormBuilder) {}

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = "";
    this.messageForm.markAllAsTouched();

    if (this.messageForm.invalid) {
      return;
    }

    // TODO: send to API when backend is ready
    this.successMessage = "Thanks! Your message has been sent.";
    this.messageForm.reset();
    this.submitted = false;
  }

  get name() {
    return this.messageForm.get("name");
  }

  get email() {
    return this.messageForm.get("email");
  }

  get message() {
    return this.messageForm.get("message");
  }
}
