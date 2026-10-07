"""
Scrapes vehicle make / model / year data from sahibinden.com's search filters.
Uses Playwright + Chromium to bypass Cloudflare. Runs slowly on purpose.
Output: scraped_vehicles_raw.json  (make → models → years)
"""

import json, time, random
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

OUT = Path(__file__).parent.parent / "scraped_vehicles_raw.json"
URL = "https://www.sahibinden.com/otomobil"

def rand_sleep(min_s=1.5, max_s=3.5):
    time.sleep(random.uniform(min_s, max_s))

def scrape():
    result = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/124.0.0.0 Safari/537.36",
            locale="tr-TR",
            viewport={"width": 1280, "height": 800},
        )
        page = ctx.new_page()

        print("Opening sahibinden otomobil...")
        page.goto(URL, wait_until="domcontentloaded", timeout=30000)
        rand_sleep(3, 5)

        # Dismiss cookie banner if present
        try:
            page.click("button:has-text('Kabul Et')", timeout=3000)
            rand_sleep()
        except PWTimeout:
            pass

        # Find the make (marka) select element
        make_sel = page.locator("select#make, select[name='make'], select[name='marka'], select.make-select").first
        if make_sel.count() == 0:
            # Try to find any select with marka options
            makes_el = page.locator("select").filter(has_text="Marka").first
            if makes_el.count() == 0:
                print("Could not find make select — dumping page structure for debugging")
                selects = page.locator("select").all()
                for s in selects:
                    opts = s.locator("option").all_text_contents()
                    print(f"  select id={s.get_attribute('id')} name={s.get_attribute('name')} opts[:3]={opts[:3]}")
                browser.close()
                return result
            make_sel = makes_el

        make_options = make_sel.locator("option").all()
        makes = []
        for opt in make_options:
            val = opt.get_attribute("value")
            text = opt.inner_text().strip()
            if val and val not in ("", "0", "-1"):
                makes.append((val, text))

        print(f"Found {len(makes)} makes")

        for make_val, make_name in makes:
            print(f"  → {make_name} (val={make_val})")
            result[make_name] = {}

            # Select the make
            make_sel.select_option(make_val)
            rand_sleep(1.5, 2.5)

            # Find model select (should update after make selection)
            try:
                model_sel = page.locator("select#model, select[name='model']").first
                page.wait_for_selector("select#model option[value]:not([value=''])", timeout=5000)
                model_options = model_sel.locator("option").all()
                models = []
                for opt in model_options:
                    val = opt.get_attribute("value")
                    text = opt.inner_text().strip()
                    if val and val not in ("", "0", "-1"):
                        models.append((val, text))
            except PWTimeout:
                print(f"    no models loaded for {make_name}")
                continue

            print(f"    {len(models)} models")

            for model_val, model_name in models:
                model_sel.select_option(model_val)
                rand_sleep(1, 2)

                # Find year select
                try:
                    year_sel = page.locator("select#year, select[name='year'], select[name='yil']").first
                    page.wait_for_selector("select#year option[value]:not([value=''])", timeout=4000)
                    year_options = year_sel.locator("option").all()
                    years = []
                    for opt in year_options:
                        val = opt.get_attribute("value")
                        text = opt.inner_text().strip()
                        if val and val not in ("", "0", "-1") and text.isdigit():
                            years.append(int(text))
                    result[make_name][model_name] = sorted(years)
                except PWTimeout:
                    result[make_name][model_name] = []

            # Small pause between makes
            rand_sleep(2, 4)

            # Save incrementally after each make
            OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2))
            print(f"    saved ({make_name} done)")

        browser.close()

    print(f"\nDone. {sum(len(v) for v in result.values())} models across {len(result)} makes.")
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2))
    return result

if __name__ == "__main__":
    scrape()
