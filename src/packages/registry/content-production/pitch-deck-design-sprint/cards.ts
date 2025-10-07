import base from "./base";
const card = {
  slug: base.meta.slug,
  title: base.meta.name,
  summary: base.hero?.summary,
  badges: base.meta.badges,
  tags: base.meta.tags,
  image: base.hero?.image,
} as const;
export default card;
