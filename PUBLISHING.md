# Publishing Guide

## Pre-publishing Checklist

1. **Update package.json**

    - Set correct author name: `"author": "Your Name <your.email@example.com>"`
    - Verify version number
    - Repository URLs are already configured ✅

2. **Test the library**

    ```bash
    npm run build
    ```

3. **Create NPM account** (if you don't have one)
    - Visit https://www.npmjs.com/signup
    - Verify your email address

## Publishing Steps

### 1. Login to NPM

```bash
npm login
```

### 2. Check if package name is available

```bash
npm view use-shared-state
```

_If this returns an error, the name is available!_

### 3. Publish the package

```bash
npm publish
```

### 4. Verify publication

-   Visit https://www.npmjs.com/package/use-shared-state
-   Test installation: `npm install @stackoverprof/use-shared-state swr`

## Post-publishing

1. **Add badges to README**

    ```markdown
    [![npm version](https://badge.fury.io/js/use-shared-state.svg)](https://badge.fury.io/js/use-shared-state)
    [![downloads](https://img.shields.io/npm/dm/use-shared-state.svg)](https://www.npmjs.com/package/use-shared-state)
    ```

2. **Optional: Set up GitHub repository**
    - Create repository for source code
    - Add repository URLs to package.json later if needed

## Updating the Package

1. **Make changes**
2. **Update version** (follow semantic versioning)
    ```bash
    npm version patch  # for bug fixes
    npm version minor  # for new features
    npm version major  # for breaking changes
    ```
3. **Build and publish**
    ```bash
    npm run build
    npm publish
    ```

## Ready to Publish!

Your package.json is already configured correctly. Just update the author name and you're ready to publish!
