# QA Test Report — Hello World Implementations

**Date:** 2026-04-14  
**Tester:** QA Engineer (automated)  
**Scope:** Verify all three Hello World scripts (Python, Bash, Ruby) in `boards/test-rodri/`  
**Environment:** Linux container — bash 5.x, python3, ruby 3.3.6

---

## Summary

| Script | File | Status | Output Correct | Exit Code | Runs Without Errors |
|--------|------|--------|----------------|-----------|---------------------|
| Bash   | `hello_world.sh` | ✅ EXISTS | ✅ PASS | ✅ 0 | ✅ PASS |
| Python | `hello_world.py` | ❌ MISSING | ❌ N/A | ❌ N/A | ❌ N/A |
| Ruby   | `hello_world.rb` | ❌ MISSING | ❌ N/A | ❌ N/A | ❌ N/A |

**Overall Result: ❌ FAIL — 2 of 3 scripts do not exist**

---

## Detailed Test Results

### 1. Bash — `hello_world.sh`

#### Test 1.1: Output Exactness (string comparison)
- **Input:** `bash hello_world.sh`
- **Expected:** `Hello, World!`
- **Actual:** `Hello, World!`
- **Result:** ✅ PASS

#### Test 1.2: Byte-Level Output Verification
- **Input:** `bash hello_world.sh | od -An -tx1`
- **Expected hex:** `48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21 0a`
- **Actual hex:** `48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21 0a`
- **Result:** ✅ PASS — No extra whitespace, trailing characters, or encoding issues

#### Test 1.3: Exit Code
- **Input:** `bash hello_world.sh; echo $?`
- **Expected:** `0`
- **Actual:** `0`
- **Result:** ✅ PASS

#### Test 1.4: Interpreter Execution (no errors on stderr)
- **Input:** `bash hello_world.sh 2>&1`
- **Expected:** Only `Hello, World!` on stdout, nothing on stderr
- **Actual:** `Hello, World!` only
- **Result:** ✅ PASS

#### Test 1.5: Shebang Line
- **Expected:** `#!/bin/bash`
- **Actual:** `#!/bin/bash`
- **Result:** ✅ PASS

#### Test 1.6: Execute Permission
- **Expected:** File has `+x` permission
- **Actual:** `-rwxr-xr-x`
- **Result:** ✅ PASS

#### Test 1.7: Direct Execution (via shebang)
- **Input:** `./hello_world.sh`
- **Expected:** `Hello, World!` with exit code 0
- **Actual:** `Hello, World!` with exit code 0
- **Result:** ✅ PASS

### 2. Python — `hello_world.py`

- **Result:** ❌ FILE DOES NOT EXIST
- **Notes:** No `.py` file found in `boards/test-rodri/` or any subdirectory. Cannot run any tests.

### 3. Ruby — `hello_world.rb`

- **Result:** ❌ FILE DOES NOT EXIST
- **Notes:** No `.rb` file found in `boards/test-rodri/` or any subdirectory. Cannot run any tests.

---

## Acceptance Criteria Evaluation

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | All three scripts print exactly 'Hello, World!' | ❌ FAIL | Only Bash script exists and prints correctly. Python and Ruby scripts are missing. |
| 2 | All scripts exit with return code 0 | ❌ FAIL | Only Bash exits with 0. Python and Ruby scripts are missing. |
| 3 | Each script runs successfully using its respective interpreter | ❌ FAIL | Bash runs correctly via `bash` interpreter. Python and Ruby scripts are missing. |
| 4 | A test report documenting results for all three scripts | ✅ PASS | This report documents findings for all three (including missing status). |

---

## Defects Found

### DEF-001: Missing Python Hello World Script (Blocker)
- **Severity:** Blocker
- **Description:** `hello_world.py` does not exist in `boards/test-rodri/`
- **Expected:** A file `hello_world.py` containing a Python script that prints "Hello, World!"
- **Steps to reproduce:** `ls boards/test-rodri/` — no `.py` file present
- **Suggested fix:** Create `boards/test-rodri/hello_world.py` with content:
  ```python
  print("Hello, World!")
  ```

### DEF-002: Missing Ruby Hello World Script (Blocker)
- **Severity:** Blocker
- **Description:** `hello_world.rb` does not exist in `boards/test-rodri/`
- **Expected:** A file `hello_world.rb` containing a Ruby script that prints "Hello, World!"
- **Steps to reproduce:** `ls boards/test-rodri/` — no `.rb` file present
- **Suggested fix:** Create `boards/test-rodri/hello_world.rb` with content:
  ```ruby
  puts "Hello, World!"
  ```

---

## Notes
- All three interpreters (bash, python3, ruby) are confirmed available in the test environment.
- The existing Bash script passes all tests with flying colors.
- The board name "Polyglot hello world" confirms all three languages were intended.
