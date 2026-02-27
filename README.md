# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Docker

Build and run locally:

```bash
docker build -t bufefrontend:local .
docker run --rm -p 8080:80 bufefrontend:local
```

Then open `http://localhost:8080`.

## GitHub Actions (Container CI/CD)

- On PRs and pushes to `main`: runs `lint`, `build`, and Docker image build check.
- On pushes to `main`: publishes image to GHCR as `ghcr.io/<owner>/<repo>` with tags (`sha`, branch, and `latest` on default branch).
- On pushes to `main`: deploys to Kubernetes using manifests in `k8s/`.

## Kubernetes

Manifests are available in `k8s/`:

- `deployment.yaml`
- `service.yaml`
- `ingress.yaml`
- `kustomization.yaml`

Before applying:

1. Set your image in `k8s/deployment.yaml`:

```yaml
image: ghcr.io/<owner>/<repo>:latest
```

2. Ingress host is already set to:

```yaml
host: bufefront-panyik-krisztian.jcloud.jedlik.cloud
```

Apply manifests:

```bash
kubectl apply -k k8s
```

If GHCR package is private, create an image pull secret and reference it in the Deployment.

For automatic deployment from GitHub Actions, add repository secret:

- `KUBE_CONFIG`: your kubeconfig file content (plain text)
