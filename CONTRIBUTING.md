# Contributing to Base MCP

Thank you for your interest in contributing to the Base MCP server! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with the following information:

- A clear, descriptive title
- A detailed description of the bug
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Any relevant logs or screenshots
- Your environment (OS, Node.js version, etc.)

### Suggesting Enhancements

If you have an idea for an enhancement, please create an issue on GitHub with the following information:

- A clear, descriptive title
- A detailed description of the enhancement
- Any relevant examples or mockups
- Why this enhancement would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bugfix (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request. Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) as your PR's title.

## Development Setup

1. Clone your fork of the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your credentials (see README.md)
4. Build the project: `npm run build`
5. Test the MCP server: `npm test`

## Coding Standards

- Follow the existing code style
- Write clear, descriptive commit messages
- Add comments to your code where necessary
- Write tests for new features
- Update documentation when necessary

## Adding New Tools

If you want to add a new tool to the Base MCP server, follow these steps:

1. Create a new file in the `src/tools` directory
2. Implement the tool following the existing patterns
3. Add the tool to the list of available tools in `src/tools/index.ts`
4. Add documentation for the tool in the README.md
5. Add examples of how to use the tool in examples.md
6. Write tests for the tool

Existing project structure:

```
src/
├── tools/
│   ├── index.ts (exports toolsets)
│   ├── [TOOL_NAME]/ <-------------------------- ADD DIR HERE
│   │   ├── index.ts (defines and exports tools)
│   │   ├── schemas.ts (defines input schema)
│   │   └── handlers.ts (implements tool functionality)
│   └── utils/ (shared tool utilities)
```

## Testing

Please ensure that all tests pass before submitting a Pull Request. You can run tests with:

```bash
npm test
```

## Documentation

Please update the documentation when necessary, including:

- README.md
- examples.md
- Code comments
- This CONTRIBUTING.md file

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

## Questions?

If you have any questions about contributing, please create an issue on GitHub or reach out to the maintainers.

Thank you for your contributions!
