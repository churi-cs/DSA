#!/usr/bin/env python3
"""Serve the project locally and refresh the memory photo list on page loads."""

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from build_memory_manifest import build_manifest


ROOT = Path(__file__).resolve().parents[1]


class ProjectHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/assets/photos/memories.json":
            build_manifest()
        return super().do_GET()


def main():
    parser = argparse.ArgumentParser(description="Preview the birthday story on localhost.")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    build_manifest()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), ProjectHandler)
    print(f"Preview ready at http://localhost:{args.port}/#open")
    print("Add images to pic/ and reload the page to include them.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nPreview stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
