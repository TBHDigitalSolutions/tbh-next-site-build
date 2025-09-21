# Documents Directory

Short, curated landing for docs about *how we write, index, and organize docs*.

- Start here: [`project-documents_Handbook_2025-09-21.md`](./project-documents_Handbook_2025-09-21.md)
- How we index & link (rules): [`documents-indexing-linking_Standard_2025-09-21.md`](./documents-indexing-linking_Standard_2025-09-21.md)
- Refactor plan (structure & cleanup): [`documents-directory_RefactorPlan_2025-09-21.md`](./documents-directory_RefactorPlan_2025-09-21.md)

> Full, machine list is generated to `./_generated/index.json`. See global indexing standard. 

---

---

# Optional: docs generator wiring (script names)

If you choose to generate per-folder/global catalogs (recommended), add these to `package.json`:

```json
{
  "scripts": {
    "docs:build-index": "tsx scripts/docs/build-docs-index.ts",
    "docs:check": "tsx scripts/docs/validate-docs.ts",
    "precommit:docs": "npm run docs:build-index && npm run docs:check"
  }
}
```

> The **Indexing & Linking Standard** explains the generator outputs and why indexes should be generated rather than hand-maintained.&#x20;

`.gitignore` entries (if you keep generated artifacts in the repo):

```
/documents/**/_generated/
/documents/**/_assets/*-source.psd
```

---