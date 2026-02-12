function showHelp() {
  console.log(`
PyRun - Python Project Runner

Usage:
  Pyrun --version
  pyrun init <framework> [path]
  pyrun run [entry-file] [options]
  pyrun install <module[:version]> ...
  pyrun install --all
  pyrun uninstall <module>

Run Options:
  --host <host>           Specify the host address
  --port <port>           Specify the port number
  --module <module>       Run a Python module (e.g. pyinstaller, pytest)
  --reload                Enable auto-reload
  --reloadDirs <dirs>     Comma-separated directories to watch for reload
  --extraArgs <args>      Extra arguments to pass to the module or script

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
