# Coding Standards

This document defines the shebang lines, comment styles, script header requirements, and execution instructions for Python, Ruby, and Bash scripts in this repository.

---

## Script Header (All Languages)

Every script **must** begin with a header block immediately after the shebang line. The header uses the comment syntax native to each language and contains the following fields:

| Field | Required | Description |
|---|---|---|
| Script name | Yes | File name of the script |
| Description | Yes | One-line summary of what the script does |
| Author | Yes | Name or handle of the original author |
| Date | Yes | Creation date in `YYYY-MM-DD` format |
| Usage | Yes | How to run the script, including arguments |

---

## Python

### Shebang Line

```python
#!/usr/bin/env python3
```

Always use `env python3` to ensure the correct interpreter is resolved from the user's environment.

### Comment Style

- Inline comments: `# comment`
- Block comments: consecutive `#` lines
- Docstrings: triple double-quotes `"""..."""` for functions and classes

### Script Header

```python
#!/usr/bin/env python3
# Script: generate_report.py
# Description: Generates a weekly sales report from CSV data.
# Author: luquitas
# Date: 2025-01-15
# Usage: python3 generate_report.py <input_file> <output_file>
```

### Execution

```bash
python3 python/generate_report.py input.csv output.pdf
```

Or make it executable and run directly:

```bash
chmod +x python/generate_report.py
./python/generate_report.py input.csv output.pdf
```

### Additional Python Conventions

- Use 4 spaces for indentation (no tabs).
- Follow PEP 8 naming: `snake_case` for functions and variables, `PascalCase` for classes.
- Include a `if __name__ == "__main__":` guard in scripts that may also be imported.

---

## Ruby

### Shebang Line

```ruby
#!/usr/bin/env ruby
```

### Comment Style

- Inline comments: `# comment`
- Block comments: consecutive `#` lines (Ruby's `=begin`/`=end` is not used in this repo)

### Script Header

```ruby
#!/usr/bin/env ruby
# Script: parse_logs.rb
# Description: Parses application logs and extracts error entries.
# Author: luquitas
# Date: 2025-01-15
# Usage: ruby parse_logs.rb <log_file>
```

### Execution

```bash
ruby ruby/parse_logs.rb app.log
```

Or make it executable and run directly:

```bash
chmod +x ruby/parse_logs.rb
./ruby/parse_logs.rb app.log
```

### Additional Ruby Conventions

- Use 2 spaces for indentation (no tabs).
- Follow standard Ruby naming: `snake_case` for methods and variables, `PascalCase` for classes and modules.
- Prefer single-quoted strings when interpolation is not needed.

---

## Bash

### Shebang Line

```bash
#!/usr/bin/env bash
```

Use `bash` explicitly, not `sh`. This ensures Bash-specific features work correctly.

### Comment Style

- Inline comments: `# comment`
- Block comments: consecutive `#` lines

### Script Header

```bash
#!/usr/bin/env bash
# Script: deploy.sh
# Description: Deploys the application to the staging environment.
# Author: luquitas
# Date: 2025-01-15
# Usage: bash deploy.sh <environment>
```

### Execution

```bash
bash bash/deploy.sh staging
```

Or make it executable and run directly:

```bash
chmod +x bash/deploy.sh
./bash/deploy.sh staging
```

### Additional Bash Conventions

- Use `set -euo pipefail` after the header to enable strict error handling.
- Use 2 spaces for indentation.
- Quote all variable expansions: `"${variable}"` instead of `$variable`.
- Use `[[ ]]` for conditionals instead of `[ ]`.
- Use `$(command)` for command substitution instead of backticks.

---

## Inline Comments (All Languages)

- Write comments to explain **why**, not **what**. The code shows what happens; comments explain intent.
- Place comments on the line above the code they describe, not on the same line (except for very short clarifications).
- Keep comments up to date. A wrong comment is worse than no comment.

---

## Summary Table

| Standard | Python | Ruby | Bash |
|---|---|---|---|
| Shebang | `#!/usr/bin/env python3` | `#!/usr/bin/env ruby` | `#!/usr/bin/env bash` |
| Extension | `.py` | `.rb` | `.sh` |
| Comment prefix | `#` | `#` | `#` |
| Indentation | 4 spaces | 2 spaces | 2 spaces |
| Naming (files) | `snake_case` | `snake_case` | `snake_case` |
| Naming (functions) | `snake_case` | `snake_case` | `snake_case` |
| Header required | Yes | Yes | Yes |
