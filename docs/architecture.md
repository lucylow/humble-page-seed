# Architecture Overview

This document summarizes CompatGuard's architecture as described in the uploaded design doc.

- Core analysis engine (packages/core) - performs parsing, feature extraction, and compatibility checks. fileciteturn2file4
- CLI (packages/cli) - command line interface for linting and scanning projects. fileciteturn2file15
- Plugins: eslint, webpack, vite - integrations for popular toolchains. fileciteturn2file0turn2file2turn2file14
- VS Code extension (packages/vscode-extension) - editor integration (stub). fileciteturn2file6

This repo is a developer scaffold and intentionally uses stubs to keep the codebase small and runnable without heavy dependencies.
