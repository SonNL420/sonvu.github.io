# CLAUDE.md

## Deploying

PriceBook is a static app, published in two places from the default branch,
`claude/grocery-price-tracker-om77po`:

- **GitHub Pages**, through `.github/workflows/deploy-pages.yml` on every push to that branch. It
  publishes only the files the workflow copies into `_site/`.
- **The Vercel project `pricebook`** (`prj_chidPxzOKHnsYM4CpCBcMGNKHWXS`, team `son-nl-420`),
  which builds production from the same branch.

So **merging a PR into the default branch deploys both**.

- **Standing authorization (owner, 2026-10-17).** When the owner asked for work to be shipped,
  Claude may, without a separate yes:
  - merge the PR into the default branch once it is open, not a draft, mergeable and every check
    has passed (none failing or pending);
  - deploy or promote to Vercel production (`vercel deploy --prod`, `vercel promote`), only from
    the default branch.
  Afterwards, confirm the Pages run and the Vercel production deployment finished and the live
  site answers.
- **Stays with the owner:** environment variables, domains, deleting deployments or the project,
  and anything on Supabase or Stripe. Cloud sync uses each user's own Supabase project, which this
  repo never configures. `.claude/settings.json` makes these always prompt.
