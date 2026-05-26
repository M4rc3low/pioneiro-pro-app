# Contributing

Thank you for your interest in improving this project.

## Development workflow

1. Create a branch from `main`.
2. Make focused changes.
3. Run the quality checks locally.
4. Open a pull request with a clear description.

## Local checks

Before submitting changes, run:

```bash
npm install
npm run build
npm run lint
npm run typecheck
```

## Commit style

Prefer clear conventional-style commits:

```txt
feat: add student progress filters
fix: correct visit scheduling state
docs: improve README structure
refactor: simplify local client layer
```

## Pull request checklist

- [ ] The project builds successfully
- [ ] No credentials or sensitive data were added
- [ ] The change is focused and easy to review
- [ ] Documentation was updated when needed
- [ ] Screenshots were added for visual changes when possible

## Code standards

- Keep components small and purposeful
- Prefer readable naming over clever abstractions
- Keep business logic separated from UI when possible
- Avoid hardcoded sensitive data
- Use consistent formatting and project conventions
