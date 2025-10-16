Prompt for Generating an Ultra-Modern Angular Application

High-Level Goal

Create a complete, single-file, ultra-modern Angular application that serves as a "[Your Application Name]". The application must demonstrate the latest Angular features and best practices, focusing on performance and a clean, reactive architecture.

Core Architectural Requirements

Framework: Use Angular with standalone components. No NgModules should be used.

Change Detection: The application must be configured to run without Zone.js. All components must use changeDetection: ChangeDetectionStrategy.OnPush.

State Management:

Implement a lightweight, service-based Signal Store for all application state. Do not use NgRx, Akita, or other third-party state management libraries.

The store must use Angular Signals (signal, computed, effect) as its foundation.

Reactivity: All state access in the component templates should be done by reading from signals directly. Avoid using the async pipe.

Styling: Use Tailwind CSS for all styling to create a clean, modern, and fully responsive user interface.

Styling and UX Details

Layout: Centered, single-column layout with a maximum width.

Theme: Describe the desired theme (e.g., "Dark mode: Dark gray background, lighter text, and a primary accent color of purple.").

Interactivity:

Use hover effects for buttons and list items.

Add subtle CSS transitions for a smooth user experience.

The UI must be fully responsive and look great on both mobile and desktop screens.

Final Output Requirements

The entire application (service, component, template, and styles) must be delivered in a single .ts file.

The code must be well-commented, especially the Store service, to explain how signals, computed signals, and effects are being used.

The generated code must be complete, runnable, and strictly adhere to all requirements listed above.
