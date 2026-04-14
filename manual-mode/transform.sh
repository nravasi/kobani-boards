#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$SCRIPT_DIR/greet.sh" ]; then
  echo "Error: greet.sh not found" >&2
  exit 1
fi

if [ ! -x "$SCRIPT_DIR/greet.sh" ]; then
  echo "Error: greet.sh is not executable" >&2
  exit 1
fi

"$SCRIPT_DIR/greet.sh" | tr '[:lower:]' '[:upper:]'
