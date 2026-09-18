# Project coding preferences

- Always use arrow functions for JavaScript/React components, helpers, and callbacks.
- Use JSX for React markup and keep reusable components in separate files.
- Prefer implicit returns for expression-only arrow functions and JSX components. Keep explicit returns where multi-step logic requires them or guard clauses improve readability.
- Add automated tests for every new feature. Cover observable behavior, relevant edge cases, and error states; update existing tests when behavior changes.
- Keep tests deterministic and independent of live services. Mock external boundaries and prefer accessible role/name queries for UI tests over implementation details or large snapshots.
- Run the relevant test suites before considering a feature complete, and report any failures or checks that could not be run.
