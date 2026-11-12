"""Real SW lifecycle QA, loopback HTTPS only, synthetic certificate and data.
Run against a local TLS server: python3 tests/pwa-browser-smoke.py https://127.0.0.1:8443
The certificate exception exists only in this disposable QA browser.
"""
import json
import sys
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
origin = (sys.argv[1] if len(sys.argv) > 1 else 'https://127.0.0.1:8443').rstrip('/')
parsed = urlparse(origin)
assert parsed.scheme == 'https' and parsed.hostname in ('127.0.0.1', 'localhost'), 'Local HTTPS only'
checks = 0
def check(condition, label):
    global checks
    assert condition, label
    checks += 1
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--ignore-certificate-errors'])
    context = browser.new_context(ignore_https_errors=True)
    foreign, errors = [], []
    context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(origin + '/') else route.abort())
    context.on('request', lambda request: foreign.append(request.url) if not request.url.startswith(origin + '/') else None)
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(origin + '/')
    page.wait_for_function('navigator.serviceWorker.controller !== null')
    check(page.evaluate('isSecureContext'), 'secure loopback context')
    keys = page.evaluate('caches.keys()')
    check(len(keys) == 1 and keys[0].startswith('mi-congregacion-shell-'), 'public shell cache installed')
    resources = page.evaluate('caches.keys().then(async keys=>(await (await caches.open(keys[0])).keys()).map(r=>new URL(r.url).pathname))')
    check('/dev-membership-status-ui.mjs' in resources, 'membership module available offline')
    check(not any('/api/' in path or '/auth/' in path for path in resources), 'no private endpoints cached')
    check(not page.locator('#versionBanner').is_visible(), 'no unsolicited update prompt')
    # Register the same public worker under a different script URL: real waiting
    # lifecycle without modifying application files or a deployed service worker.
    page.evaluate('navigator.serviceWorker.register("/sw.js?qa-update=1",{scope:"/",updateViaCache:"none"})')
    page.wait_for_selector('#versionBanner', state='visible')
    check(page.evaluate('navigator.serviceWorker.controller.scriptURL.endsWith("/sw.js")'), 'update waits for user')
    with page.expect_navigation():
        page.locator('#versionBanner button').click()
    page.wait_for_function('navigator.serviceWorker.controller.scriptURL.includes("qa-update=1")')
    check(page.locator('#normalAccessGuide').is_visible(), 'opt-in activation reloads public shell')
    context.set_offline(True)
    page.reload()
    check(page.locator('#normalAccessGuide').is_visible(), 'offline Normal stays closed')
    check(not page.locator('.bottom').is_visible(), 'offline Normal hides private navigation')
    check(page.locator('#connectionBanner').is_visible(), 'offline status visible')
    page.locator('#accountMenu summary').click()
    page.locator('#useDevMode').click()
    page.wait_for_selector('#fixtureScenario')
    check(page.locator('#fixtureScenario option').count() == 13, 'all DEV scenarios load offline')
    page.locator('#fixtureScenario').select_option('revoked')
    check(page.locator('[data-demo-membership="revoked"]').count() == 1, 'offline revoked state')
    check(not page.locator('.bottom').is_visible(), 'revoked hides agenda')
    context.set_offline(False)
    check(not errors, 'no JS errors: ' + repr(errors))
    check(not foreign, 'no external requests: ' + repr(foreign))
    context.close()
    browser.close()
print(json.dumps({'checks':checks,'pass':checks,'fail':0,'external_requests':0,'javascript_errors':0,'tls':'synthetic loopback certificate, not public TLS QA'}))
