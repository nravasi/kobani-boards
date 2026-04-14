# scripts-luquitas

A collection of Hello World scripts in Python, Ruby, and Bash. This workspace is part of the [kobani-boards](https://github.com/nravasi/kobani-boards) repository.

## Purpose

This repository provides a consistent starting point for writing scripts in multiple languages. Each script follows shared coding standards and naming conventions so that contributors can add new scripts without guessing at structure or style.

## Directory Structure

```
scripts-luquitas/
├── python/              # Python scripts (.py)
├── ruby/                # Ruby scripts (.rb)
├── bash/                # Bash scripts (.sh)
│   └── hello_world.sh   # Hello World in Bash (language folder)
├── hello.py             # Hello World in Python
├── hello.rb             # Hello World in Ruby
├── hello.sh             # Hello World in Bash
├── CODING_STANDARDS.md  # Shebang lines, headers, and style rules
├── REPO_STRUCTURE.md    # Directory layout and naming conventions
├── README_TEMPLATE.md   # Template for creating new READMEs
└── README.md            # This file
```

## Prerequisites

Install the following tools before running any scripts.

| Language | Tool      | Minimum Version | Check Command       |
|----------|-----------|-----------------|---------------------|
| Python   | `python3` | 3.6+            | `python3 --version` |
| Ruby     | `ruby`    | 2.5+            | `ruby --version`    |
| Bash     | `bash`    | 4.0+            | `bash --version`    |

No external libraries or packages are required. Each script uses only the standard library of its language.

## Running the Hello World Scripts

All commands below assume you are inside the `scripts-luquitas/` directory.

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

Expected output:

```
Hello, World!
```

There is also a Bash script inside the `bash/` language folder:

```bash
bash bash/hello_world.sh
```

Expected output:

```
Hello, World!
```

You can also make any script executable and run it directly:

```bash
chmod +x hello.sh
./hello.sh
```

## Contributing

Follow these steps to add a new script to the repository.

### 1. Choose the right folder

Place your script in the folder that matches its language:

| Language | Folder     | Extension |
|----------|------------|-----------|
| Python   | `python/`  | `.py`     |
| Ruby     | `ruby/`    | `.rb`     |
| Bash     | `bash/`    | `.sh`     |

### 2. Name your file

Use `snake_case`, lowercase letters, and the correct file extension. See [REPO_STRUCTURE.md](REPO_STRUCTURE.md) for full naming rules.

Good: `fetch_api_data.py`
Avoid: `FetchApiData.py`, `fetch-api-data.py`, `script1.py`

### 3. Add the required header

Every script must start with a shebang line followed by a header block. The header includes the script name, a description, the author, the creation date, and usage instructions.

**Python example:**

```python
#!/usr/bin/env python3
# Script: fetch_api_data.py
# Description: Fetches data from the public API and saves it as JSON.
# Author: your-name
# Date: 2025-01-15
# Usage: python3 fetch_api_data.py <endpoint>
```

**Ruby example:**

```ruby
#!/usr/bin/env ruby
# Script: parse_logs.rb
# Description: Parses application logs and extracts error entries.
# Author: your-name
# Date: 2025-01-15
# Usage: ruby parse_logs.rb <log_file>
```

**Bash example:**

```bash
#!/usr/bin/env bash
# Script: deploy.sh
# Description: Deploys the application to the staging environment.
# Author: your-name
# Date: 2025-01-15
# Usage: bash deploy.sh <environment>
```

See [CODING_STANDARDS.md](CODING_STANDARDS.md) for the full set of style rules per language.

### 4. Test before committing

Run your script and confirm it produces the expected output. Fix any errors before pushing.

### 5. Commit with a clear message

Write a commit message that describes what the script does.

```bash
git add python/fetch_api_data.py
git commit -m "Add script to fetch API data and save as JSON"
git push origin main
```

## Reference Documents

| Document | Description |
|----------|-------------|
| [REPO_STRUCTURE.md](REPO_STRUCTURE.md) | Directory layout, naming conventions, and file extension standards |
| [CODING_STANDARDS.md](CODING_STANDARDS.md) | Shebang lines, comment styles, script headers, and language-specific rules |
| [README_TEMPLATE.md](README_TEMPLATE.md) | Template for creating new README files |
