#!/bin/bash
set -e

# Post-merge setup for Amber's Alchemy Apothecary.
# Static Express app with no build step — only needs dependencies installed.
# Idempotent and non-interactive.
npm install --no-audit --no-fund
