---
title: "Time Field Standard for Document Frontmatter"
domain: "docs"
file: "time-field_Standard_2025-10-01.md"
main: "time-field"
qualifier: "Standard"
date: "2025-10-01"
time: "14:30"
status: "Draft"
owners: ["@conor"]
tags: ["docs","standards","yaml","frontmatter","time"]
spotlight:
  - "Defines required format for the time field in YAML frontmatter"
  - "Primary standard is 24-hour clock (HH:MM) for consistency"
  - "Hybrid format preserves 12-hour with 24-hour fallback when needed"
  - "Filenames must always use 24-hour format without colons"
summary: "This policy defines the required format for the time field within all YAML frontmatter headers to ensure consistency and facilitate automated parsing across our documentation system. It establishes the 24-hour format as the primary standard, allows a hybrid fallback for 12-hour times, and enforces consistent filename conventions."
links:
  related: []

---

# Time Field Standard for Document Frontmatter

This policy defines the required format for the **`time`** field within all YAML frontmatter headers to ensure consistency and facilitate automated parsing across our documentation system.

---

## 1. Primary Standard: 24-Hour Clock (HH:MM)

- The primary standard for the `time` field is the **24-hour clock format** (military time).
- Required for **all new and revised documents**, unless the source only provides 12-hour format.
- This avoids AM/PM ambiguity and provides international consistency.

**Format:** `HH:MM` (always use leading zeros).

### Examples

**Morning**
```yaml
# Source time is 8:15 AM
time: "08:15"
````

**Afternoon**

```yaml
# Source time is 4:30 PM
time: "16:30"
```

---

## 2. Hybrid Format: 12-Hour Fallback

If the source provides **only 12-hour format** (and must be preserved for historical or display reasons), use the **Hybrid Format**.

* Retain the original 12-hour value.
* Append the required 24-hour equivalent.
* Separate with **`|`** (space-pipe-space).

### Rule

```
<12-hour> | <24-hour>
```

### Examples

**Morning (Preserved)**

```yaml
# Source time is 11:47am
time: "11:47am | 11:47"
```

**Afternoon (Preserved)**

```yaml
# Source time is 12:02pm
time: "12:02pm | 12:02"
```

**Evening (Preserved)**

```yaml
# Source time is 9:00pm
time: "9:00pm | 21:00"
```

---

## 3. Summary of File Naming

Regardless of YAML frontmatter:

* **Filenames must always use the 24-hour format.**
* **Remove the colon (`:`)** for filesystem safety.

### Example

YAML field:

```yaml
time: "14:30"
```

File path:

```
..._2025-10-01-1430.md
```

YAML hybrid field:

```yaml
time: "9:00pm | 21:00"
```

File path:

```
..._2025-10-01-2100.md
```

---

✅ This ensures consistency across YAML headers and file paths, while allowing historical 12-hour formats to be preserved when required.

---


