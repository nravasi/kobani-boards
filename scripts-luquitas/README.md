# scripts-luquitas

A collection of scripts in multiple programming languages. This workspace is part of the [kobani-boards](https://github.com/nravasi/kobani-boards) repository. It contains coding standards, repository structure guidelines, and runnable scripts.

## Standards and Documentation

| Document | Description |
|---|---|
| [REPO_STRUCTURE.md](REPO_STRUCTURE.md) | Directory layout, naming conventions, and file extension standards |
| [CODING_STANDARDS.md](CODING_STANDARDS.md) | Shebang lines, comment styles, script headers, and execution instructions |
| [README_TEMPLATE.md](README_TEMPLATE.md) | Template for the repository root README |

## Directory Structure

```
scripts-luquitas/
├── python/              # Python scripts (.py)
├── ruby/                # Ruby scripts (.rb)
├── bash/                # Bash scripts (.sh)
├── hello.py             # Hello World in Python
├── hello.rb             # Hello World in Ruby
├── hello.sh             # Hello World in Bash
├── REPO_STRUCTURE.md    # Structure and naming conventions
├── CODING_STANDARDS.md  # Coding standards for all languages
├── README_TEMPLATE.md   # README template for repo root
└── README.md            # This file
```

## Quick Reference

| Language | Folder | Extension | Shebang |
|---|---|---|---|
| Python | `python/` | `.py` | `#!/usr/bin/env python3` |
| Ruby | `ruby/` | `.rb` | `#!/usr/bin/env ruby` |
| Bash | `bash/` | `.sh` | `#!/usr/bin/env bash` |

See [CODING_STANDARDS.md](CODING_STANDARDS.md) for full details.

## Prerequisites

| Language | Tool       | Minimum Version | Check Command      |
|----------|------------|-----------------|---------------------|
| Python   | `python3`  | 3.6+            | `python3 --version` |
| Ruby     | `ruby`     | 2.5+            | `ruby --version`    |
| Bash     | `bash`     | 4.0+            | `bash --version`    |

## Running the Scripts

### Python

```bash
python3 hello.py
```

### Ruby

```bash
ruby hello.rb
```

### Bash

```bash
bash hello.sh
```

## Contributing

1. Place new scripts in the correct language folder (`python/`, `ruby/`, or `bash/`).
2. Follow the naming conventions in [REPO_STRUCTURE.md](REPO_STRUCTURE.md).
3. Include the required script header as defined in [CODING_STANDARDS.md](CODING_STANDARDS.md).
4. Test your script before committing.
5. Write a clear commit message describing what the script does.
