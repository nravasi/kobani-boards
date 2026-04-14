# Repository Structure and Naming Conventions

This document defines the top-level directory layout, naming conventions, and file extension standards for all scripts in this repository.

---

## Top-Level Directory Layout

```
scripts-luquitas/
├── python/          # All Python scripts
├── ruby/            # All Ruby scripts
├── bash/            # All Bash/shell scripts
├── REPO_STRUCTURE.md
├── CODING_STANDARDS.md
├── README_TEMPLATE.md
└── README.md
```

Each language has its own top-level folder. Scripts must be placed in the folder matching their language. Do not mix languages within a single folder.

### `python/`

Contains all Python scripts (`.py`). Subdirectories may be created for logical grouping when a category contains more than five scripts.

```
python/
├── data_cleanup.py
├── generate_report.py
└── utils/
    └── csv_helper.py
```

### `ruby/`

Contains all Ruby scripts (`.rb`). Same subdirectory policy as Python.

```
ruby/
├── parse_logs.rb
├── send_notification.rb
└── formatters/
    └── json_formatter.rb
```

### `bash/`

Contains all Bash scripts (`.sh`). Same subdirectory policy as Python and Ruby.

```
bash/
├── deploy.sh
├── backup_db.sh
└── setup/
    └── install_deps.sh
```

---

## Naming Conventions

### General Rules (All Languages)

| Rule | Example | Avoid |
|---|---|---|
| Use `snake_case` for all file names | `process_data.py` | `processData.py`, `Process-Data.py` |
| Names must be lowercase | `run_tests.sh` | `Run_Tests.sh` |
| Names must be descriptive and concise | `send_email.rb` | `script1.rb`, `s.rb` |
| No spaces or special characters | `clean_logs.sh` | `clean logs.sh`, `clean-logs!.sh` |
| Hyphens are not used in script names | `fetch_api_data.py` | `fetch-api-data.py` |

### File Extensions

| Language | Extension | Example |
|---|---|---|
| Python | `.py` | `generate_report.py` |
| Ruby | `.rb` | `parse_logs.rb` |
| Bash | `.sh` | `deploy.sh` |

Every script file **must** include the correct extension for its language. Extensionless scripts are not permitted.

### Subdirectory Naming

- Subdirectories also use `snake_case` and lowercase.
- Name directories after the category of scripts they contain (e.g., `utils/`, `formatters/`, `setup/`).
- Avoid nesting beyond two levels (e.g., `python/utils/` is fine; `python/utils/helpers/internal/` is not).

---

## What Goes Where

| File Type | Location |
|---|---|
| Python script | `python/` |
| Ruby script | `ruby/` |
| Bash/shell script | `bash/` |
| Documentation and standards | Repository root (`scripts-luquitas/`) |
| Shared data files (CSV, JSON, etc.) | Alongside the script that uses them, or in a `data/` subfolder within the language directory |
| Configuration files | Alongside the script that uses them |

---

## Adding a New Script

1. Place it in the correct language folder (`python/`, `ruby/`, or `bash/`).
2. Name it using `snake_case` with the correct file extension.
3. Include the required script header (see [CODING_STANDARDS.md](CODING_STANDARDS.md)).
4. Make Bash scripts executable: `chmod +x bash/your_script.sh`.
5. Commit with a message describing what the script does.
