// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  const __REWYT_VERSION__: string;
  const __REWYT_RELEASE_DATE__: string;
  const __REWYT_DOWNLOADS__: {
    linux: string;
    macos: string;
    windows: string;
  };

  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
