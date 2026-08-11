#!/usr/bin/env python3
"""Local dev server with caching disabled.

Plain `python3 -m http.server` lets the browser cache the Babel `.jsx` files,
which repeatedly made edits look like they "didn't show up" (you'd reload and
see the old screen). This server sends `Cache-Control: no-store` so every reload
fetches the current file — no hard-reload, no `?v=` bumping needed.

Run instead of http.server:

    python3 serve.py          # http://localhost:8001/index.html
    python3 serve.py 9000     # another port, if 8001 is taken
"""
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8001


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('', PORT), NoCacheHandler) as httpd:
        print(f'Design dev server (no-cache) -> http://localhost:{PORT}/index.html')
        httpd.serve_forever()
