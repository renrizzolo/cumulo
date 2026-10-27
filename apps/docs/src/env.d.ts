// This is the custom parcel pipeline
// for displaying unbundled code as text.
// See parcel.config.ts; it skips the built-in bundle-text: pipeline ("...").
declare module 'raw-text:*' {
  const content: string;
  export default content;
}
