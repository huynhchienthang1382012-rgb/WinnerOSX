# WinnerOS

WinnerOS is a polished desktop operating system simulation built as a modular browser application.

## Run locally

```bash
python3 -m http.server 3000
```

Then open `http://localhost:3000`.

## Architecture

- `src/core`: window manager and live system services
- `src/ui`: desktop shell rendering
- `src/apps`: application content modules
- `src/utils`: constants and window geometry helpers
