# Forge sandbox smoke note

Python `pip` can be used for disposable sandbox tooling, for example to check that
package installs work in the Forge sandbox (`python3 -m pip --version`, `pip install six`).

This does **not** add a Python dependency to the application. The app stays Node.js
(Next.js web, Express API) with PostgreSQL, and no Python files, requirements files or
build steps are added or needed.
