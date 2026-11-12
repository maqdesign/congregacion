"""Synthetic local Chromium QA. Requires an existing loopback server and Playwright.
Run: python3 tests/browser-smoke.py http://127.0.0.1:8000
Never targets production or sends requests outside the supplied loopback origin.
"""
import json
import sys
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

origin = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000').rstrip('/')
assert urlparse(origin).hostname in ('127.0.0.1', 'localhost'), 'Loopback only'
checks = 0
def check(condition, label):
    global checks
    assert condition, label
    checks += 1

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--allow-insecure-localhost'])
    errors, foreign = [], []
    for width in (320, 390, 768, 1440):
        context = browser.new_context(viewport={'width': width, 'height': 900}, ignore_https_errors=True)
        def route_request(route):
            if route.request.url.startswith(origin + '/'):
                route.continue_()
            else:
                foreign.append(route.request.url)
                route.abort()
        context.route('**/*', route_request)
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        for route in ('/', '/?dev=1', '/dev-ui.mjs', '/manifest.webmanifest', '/sw.js', '/brand-isotype.svg'):
            response = context.request.get(origin + route)
            check(response.status == 200, 'HTTP ' + route)
            if route.endswith('webmanifest'):
                check(response.json()['display'] == 'standalone', 'manifest JSON')
        page.goto(origin + '/?dev=1')
        check(page.locator('#normalAccessGuide').is_visible(), 'query grants no DEV mode')
        check(not page.locator('.bottom').is_visible(), 'Normal closed')
        check(page.locator('#exploreDemo').is_visible(), 'explicit sample journey offered')
        check(page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Normal no overflow')
        controls = page.locator('.global-actions button:visible,.global-actions summary:visible').evaluate_all('(els)=>els.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))')
        check(all(control['w'] >= 44 and control['h'] >= 44 for control in controls), '44px header touch targets')
        page.locator('#exploreDemo').click()
        page.wait_for_selector('#fixtureScenario')
        check(page.locator('#fixtureScenario').input_value() == 'guest', 'sample journey begins with fictional signup')
        page.locator('#accountMenu summary').click()
        page.locator('#useNormalMode').click()
        page.locator('#accountMenu summary').focus()
        page.keyboard.press('Enter')
        page.locator('#useDevMode').focus()
        page.keyboard.press('Enter')
        page.wait_for_selector('#fixtureScenario')
        scenarios = page.locator('#fixtureScenario option').evaluate_all('(els)=>els.map(e=>e.value)')
        check(len(scenarios) == 13, 'all scenarios mounted')
        banner = page.locator('#devBanner').bounding_box()
        workbench = page.locator('#devWorkbench').bounding_box()
        check(banner['y'] + banner['height'] <= workbench['y'], 'DEV status does not cover controls')
        ready = {'full', 'empty', 'cancelled', 'no-assignments'}
        membership_states = set()
        for scenario in scenarios:
            page.locator('#fixtureScenario').select_option(scenario)
            membership_states.add(page.locator('[data-demo-membership]').get_attribute('data-demo-membership'))
            check(page.locator('[data-demo-membership] button:enabled').count() == 0, 'membership card grants no real action')
            check(page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'{width}/{scenario} overflow')
            check(page.locator('.bottom').is_visible() == (scenario in ready), scenario + ' navigation guard')
            if scenario not in ready:
                check(not page.locator('[data-fixture-complete]:visible').count(), scenario + ' hides assignments')
            check(page.evaluate('scrollY') == 0, scenario + ' starts at top')
        page.locator('#fixtureScenario').select_option('guest')
        page.locator('[data-fixture-action="signup"]').first.click()
        check(page.locator('[data-fixture-action="confirm"]').evaluate('(e)=>e===document.activeElement'), 'signup focus')
        page.locator('[data-fixture-action="confirm"]').click()
        check(page.locator('[data-demo-invite="link"]').evaluate('(e)=>e===document.activeElement'), 'confirmation focus')
        page.locator('[data-demo-invite="link"]').click()
        membership_states.add('pending_review')
        check(page.locator('[data-demo-membership="pending_review"]').count() == 1, 'pending membership')
        page.locator('[data-demo-invite="reject"]').click()
        membership_states.add('rejected')
        check(page.locator('[data-demo-membership="rejected"]').count() == 1, 'rejected membership')
        check(membership_states == {'unlinked', 'pending_review', 'person_verification_required', 'permission_limited', 'rejected', 'revoked', 'approved', 'unavailable'}, 'eight membership states rendered')
        page.locator('[data-demo-invite="restart"]').click()
        page.locator('[data-demo-invite="direct"]').click()
        check(page.locator('[data-demo-membership="pending_review"]').count() == 1, 'direct sample request pending')
        page.locator('[data-demo-invite="approve"]').click()
        check(page.locator('#fixtureScenario').input_value() == 'full', 'sample approval opens only the fixture scenario')
        check(page.locator('[data-demo-membership="approved"]').count() == 1, 'sample approved state')
        page.locator('#fixtureScenario').select_option('full')
        page.locator('[data-tab="agenda"]').click()
        page.locator('[data-fixture-filter="servicio"]').focus()
        page.keyboard.press('Enter')
        check(page.locator('[data-fixture-filter="servicio"]').evaluate('(e)=>e===document.activeElement'), 'filter focus after rerender')
        check(page.locator('[data-fixture-filter="servicio"]').get_attribute('aria-pressed') == 'true', 'filter state')
        page.locator('[data-fixture-month="1"]').focus()
        page.keyboard.press('Enter')
        check(page.locator('[data-fixture-month="1"]').evaluate('(e)=>e===document.activeElement'), 'month focus after rerender')
        day = page.locator('[data-fixture-day]').first.get_attribute('data-fixture-day')
        day_control = page.locator('[data-fixture-day="' + day + '"]')
        day_control.focus()
        page.keyboard.press('Enter')
        check(day_control.evaluate('(e)=>e===document.activeElement'), 'day focus after rerender')
        check(day_control.get_attribute('aria-pressed') == 'true', 'selected calendar day')
        page.locator('#accountMenu summary').click()
        page.locator('#useNormalMode').click()
        check(page.locator('.fixture-panel').count() == 0, 'fixture DOM removed')
        check(page.locator('#normalAccessGuide').is_visible(), 'Normal remains closed')
        check(not page.locator('.bottom').is_visible(), 'private navigation hidden')
        page.reload()
        check(page.locator('.fixture-panel').count() == 0, 'Normal persists on reload')
        page.locator('#accountMenu summary').click()
        page.locator('#goSettings').click()
        page.locator('input[name="appLanguage"][value="en"]').check()
        page.locator('[data-close-dialog="settingsDialog"]').last.click()
        check(page.locator('html').get_attribute('lang') == 'en', 'English document language')
        check(page.locator('#normalAccessTitle').inner_text() == 'Your congregation, in one place', 'English entry copy')
        page.locator('#exploreDemo').click()
        page.wait_for_selector('#fixtureScenario')
        check(page.locator('[data-demo-membership="unlinked"] h2').inner_text() == 'Link your congregation', 'English membership card')
        context.close()
    check(not errors, 'no JS errors: ' + repr(errors))
    check(not foreign, 'no external requests: ' + repr(foreign))
    browser.close()
print(json.dumps({'checks': checks, 'pass': checks, 'fail': 0, 'viewports': [320, 390, 768, 1440], 'external_requests': 0, 'javascript_errors': 0}))
