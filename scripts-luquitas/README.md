# scripts-luquitas

A collection of Hello World scripts in multiple programming languages. This workspace is part of the [kobani-boards](https://github.com/nravasi/kobani-boards) repository. Its purpose is to provide simple, runnable examples that demonstrate basic script execution across languages.

## Directory Structure

```
scripts-luquitas/
├── README.md      # This file
├── hello.py       # Hello World in Python
├── hello.rb       # Hello World in Ruby
└── hello.sh       # Hello World in Bash
```

## Prerequisites

You need the following tools installed to run every script in this directory.

| Language | Tool       | Minimum Version | Check Command      |
|----------|------------|-----------------|---------------------|
| Python   | `python3`  | 3.6+            | `python3 --version` |
| Ruby     | `ruby`     | 2.5+            | `ruby --version`    |
| Bash     | `bash`     | 4.0+            | `bash --version`    |

> **Tip:** Most Linux distributions and macOS ship with Bash pre-installed. Python and Ruby may need to be installed separately via your system package manager (`apt`, `brew`, `dnf`, etc.).

## Running the Scripts

Run all commands from the `scripts-luquitas` directory.

### Python

```bash
python3 hello.py
```

Expected output:

```
Hello, World!
```

### Ruby

```bash
ruby hello.rb
```

Expected output:

```
Hello, World!
```

### Bash

```bash
bash hello.sh
```

Or make it executable and run directly:

```bash
chmod +x hello.sh
./hello.sh
```

Expected output:

```
Hello, World!
```

## Contribution Guidelines

New scripts are welcome! Follow these steps to keep the collection consistent.

### 1. Create the Script

- Add one file per language, named `hello.<ext>` (e.g., `hello.go`, `hello.rs`).
- The script must print exactly `Hello, World!` to standard output.
- Include a shebang line (`#!/usr/bin/env <interpreter>`) as the first line.
- Add a brief comment on the second line identifying the language.

### 2. Update This README

- **Directory Structure** — Add the new file to the tree listing.
- **Prerequisites** — Add a row to the prerequisites table with the language, tool, minimum version, and check command.
- **Running the Scripts** — Add a new subsection under "Running the Scripts" showing the exact command and expected output.

### 3. Commit and Push

Use a clear, descriptive commit message:

```bash
git add -A
git commit -m "Add <Language> Hello World script"
git push origin main
```

### Style Checklist

- [ ] File is named `hello.<ext>`.
- [ ] Script prints `Hello, World!` (exact string, with comma and exclamation mark).
- [ ] Shebang line uses `/usr/bin/env` for portability.
- [ ] README sections are updated to reflect the new script.
