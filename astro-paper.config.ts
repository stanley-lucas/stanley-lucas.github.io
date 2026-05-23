import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://stanley-lucas.github.io",
    title: "Stanley Lucas",
    description: "Aerospace & software engineering — building toward SpaceX, one project at a time.",
    author: "Stanley Lucas",
    profile: "https://github.com/stanley-lucas",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "America/Sao_Paulo",
    dir: "ltr",
  },
  posts: {
    perPage: 5,
    perIndex: 5,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/stanley-lucas/stanley-lucas.github.io/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/stanley-lucas" },
    { name: "x",        url: "https://x.com/stanleylucasdev" },
    { name: "linkedin", url: "https://www.linkedin.com/in/stanley-lucas-dev/" },
    { name: "mail",     url: "mailto:stanleymairon1@gmail.com" },
  ],
  shareLinks: [
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "linkedin", url: "https://www.linkedin.com/sharing/share-offsite/?url=" },
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
