"""Disposable HTTPS server for local synthetic PWA QA, never a deployment."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import ssl
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
scratch = root.parent / 'work'
scratch.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='congregacion-tls-qa-', dir=scratch) as directory:
    key, certificate = Path(directory) / 'local.key', Path(directory) / 'local.crt'
    subprocess.run(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
        '-keyout', str(key), '-out', str(certificate), '-days', '1',
        '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    tls.load_cert_chain(certificate, key)
    with ThreadingHTTPServer(('127.0.0.1', 8443), partial(SimpleHTTPRequestHandler, directory=root / 'app')) as server:
        server.socket = tls.wrap_socket(server.socket, server_side=True)
        print('Synthetic HTTPS QA: https://127.0.0.1:8443 (loopback only)', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
