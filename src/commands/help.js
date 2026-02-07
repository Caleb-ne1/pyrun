function showHelp() {
  console.log(`
PyRun - Python Project Runner

Usage:
  Pyrun --version
  pyrun init <framework> [path]
  pyrun run [entry-file] [--port <port>] [--host <host>]
  pyrun install <module[:version]> ...
  pyrun install --all
  pyrun uninstall <module>

Examples:
  pyrun init fastapi .
  pyrun run app.py --port 3000 --host 0.0.0.0
  pyrun install requests flask:2.0.1
  pyrun install --all
  pyrun uninstall requests

Supported Frameworks:
  django
  flask
  fastapi
  python
`);
}

module.exports = { showHelp };
