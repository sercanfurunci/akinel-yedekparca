#!/usr/bin/env python3
"""
Turkey-market vehicle catalog importer.
Source C (giraysam): arac_marka_modeller_2022.sql  — brands, models, years
Source A (ilyasozkurt): brands.json, automobiles.json, engines.json — engine specs enrichment
"""

import re
import json
import sys
import unicodedata
import psycopg2
import psycopg2.extras
from pathlib import Path

# ────────────────────────────────────────────────
# Config
# ────────────────────────────────────────────────
DB_DSN = "host=localhost port=5432 dbname=akinel_db user=akinel_user password=akinel_pass"
SQL_FILE = "/tmp/source-c/arac_marka_modeller_2022.sql"
BRANDS_JSON = "/tmp/automobile-dataset/brands.json"
AUTOS_JSON  = "/tmp/automobile-dataset/automobiles.json"
ENGINES_JSON= "/tmp/automobile-dataset/engines.json"

# ────────────────────────────────────────────────
# Brand normalization
# ────────────────────────────────────────────────
BRAND_MAP = {
    'TOFAS-FIAT': 'FIAT',
    'FORD/OTOSAN': 'FORD',
    'RENAULT (OYAK)': 'RENAULT',
    'RENAULT': 'RENAULT',
    'FIAT': 'FIAT',
    'FORD': 'FORD',
    'FORD /USA': 'FORD',
    'RANGE ROVER': 'LAND ROVER',
    'MERCEDES': 'MERCEDES-BENZ',
}

INCLUDE_BRANDS = {
    'FIAT','RENAULT','FORD','VOLKSWAGEN','TOYOTA','HYUNDAI','KIA','PEUGEOT',
    'CITROEN','OPEL','DACIA','MERCEDES-BENZ','BMW','AUDI','SKODA','SEAT',
    'HONDA','NISSAN','SUZUKI','MITSUBISHI','MAZDA','VOLVO','SUBARU','JEEP',
    'MINI','ALFA ROMEO','LANCIA','LAND ROVER','SAAB','LEXUS','INFINITI',
    'PORSCHE','JAGUAR','SMART','DS','CUPRA','ROVER',
}

# Body types to exclude (heavy commercial / industrial)
EXCLUDE_PATTERNS = [
    r'\bKAMYON\b(?!ET)',   # KAMYON but NOT KAMYONET
    r'\bOTOBUS\b',
    r'\bMIDIBUS\b',
    r'\bTRAKTOR\b',
    r'\bIS MAKINASI\b',
    r'\bCEKICI\b',
    r'\bDAMPERLI\b',
    r'\bBETON MIKSER\b',
    r'\bTANKER\b',
    r'\bKAZICI\b',
    r'\bSCANIA\b',
    r'\bMAN\b',
    r'\bNEOPLAN\b',
    r'\bSETRA\b',
    r'\bMINIBUS\b',  # we'll special-case keep MINIVAN below
]

# Model names that are always kept even if commercial
ALWAYS_KEEP_MODELS = {
    'FIORINO','DOBLO','COURIER','KANGOO','CADDY','TRANSPORTER','TRANSIT',
    'CARGO','COMBI','EXPRESS','FRIGO','PANELVAN','KAMYONET','MINIVAN',
    'COMBO','MOVANO','MASTER','TRAFIC','JUMPER','BOXER','DUCATO',
    'JUMPY','BERLINGO','PARTNER','PROACE',
}

ALWAYS_KEEP_SUBSTRINGS = [
    'CARGO','COMBI','EXPRESS','FRIGO','PANELVAN','KAMYONET','MINIVAN',
    'KOMBIVAN',
]

# Multi-word body type markers — ordered longest first for matching
BODY_MARKERS_MULTIWORD = [
    'STATION WAGON', 'GRAN COUPE', 'GRAN TURISMO',
    'ACTIVE TOURER', 'SPORT TOURER', 'GRAND TOUR',
]

# Single-word body type markers
BODY_MARKERS_SINGLE = [
    'HATCHBACK', 'HATCBACK', 'CABRIOLET', 'CONVERTIBLE', 'KOMBIVAN',
    'SPORTBACK', 'ALLROAD', 'PANELVAN', 'MINIVAN', 'MULTIX', 'PANORAMA',
    'KAMYONET', 'SEDAN', 'ESTATE', 'TOURING', 'CABRIO', 'CARGO', 'COMBI',
    'KOMBI', 'TOURER', 'AVANT', 'COUPE', 'COUPE-GRAN', 'CROSS', 'PICKUP',
    'CW', '3K', '5K', 'WAGON', 'MAXI', 'FRIGO', 'EXPRESS',
    # Abbreviations / variants found in source C
    'S.WAGON', 'STATIONWAGON', 'S.W', 'HB', 'SW', 'SUV', 'MPV', 'VAN',
]

ALL_BODY_MARKERS = BODY_MARKERS_MULTIWORD + BODY_MARKERS_SINGLE

# Body type canonical names (normalization map)
BODY_NORMALIZE = {
    'HATCHBACK': 'HB',
    'HATCBACK': 'HB',
    'STATIONWAGON': 'SW',
    'S.WAGON': 'SW',
    'S.W': 'SW',
    'GRAN COUPE': 'COUPE',
    'GRAN TURISMO': 'COUPE',
    'CABRIOLET': 'CABRIO',
    'CONVERTIBLE': 'CABRIO',
    'ESTATE': 'SW',
    'TOURING': 'SW',
    'GRAND TOUR': 'SW',
    'SPORT TOURER': 'SW',
    'STATION WAGON': 'SW',
    'KOMBIVAN': 'KOMBI',
}

# Stop words for base model name extraction:
# When any of these tokens appear as a stand-alone word after the model prefix, stop extracting.
# This covers: body types, trim levels, marketing words, etc.
ALL_STOP_TOKENS = set(BODY_MARKERS_SINGLE + [
    # From BODY_MARKERS_MULTIWORD (individual tokens that start them)
    'STATION', 'GRAN', 'ACTIVE', 'SPORT', 'GRAND',
    # Trim / grade markers
    'EASY', 'URBAN', 'LOUNGE', 'MIRROR', 'TECHPACK', 'SAFELINE', 'PREMIUM',
    'EXCLUSIVE', 'TITANIUM', 'TITANIUM+', 'VIGNALE', 'TREND', 'ELITE', 'PRESTIGE',
    'ST-LINE', 'AMBIENTE', 'COMFORT', 'CONFORT', 'ELEGANCE', 'DYNAMIQUE',
    'INITIALE', 'BOSE', 'INTENSE', 'LIMITED', 'BUSINESS', 'EXECUTIVE',
    'MOTION', 'ENJOY', 'EDITION', 'DESIGN', 'STYLE', 'STYLE+', 'LIFE',
    'ADVANCE', 'CONNECT', 'VISION', 'SENSE', 'LINE', 'PLUS', 'ROADSTER',
    # FIAT-specific model sub-names and edition names
    'ACTUAL', 'VIA', 'DYNAMIC', 'EMOTION', 'JOY', 'TOUCH', 'ICON',
    'SOLE', 'PREMIO', 'MOOD', 'POP', 'TREKKING', 'COMBIMIX', 'COMBISAFELINE',
    'KASALI', 'SASI', 'PANO.', 'PAN.',
    'ANNIVERSARIO', 'COLLOZIONE', 'CULT', 'DOLCEVITA', 'POPSTAR', 'RIVA',
    'BEATS', 'LIVING', 'ROCKSTAR', 'CLASSIC', 'MIRROR', 'GQ',
    # Generic edition/sub-model names
    'FINAL', 'FIRST', 'SPECIAL', 'ORIGINAL', 'ANNIVERSARY',
    # Marketing prefixes
    'MY',
    # Color / appearance
    'BLACK', 'RED', 'WHITE', 'BLUE', 'SILVER',
    # Misc abbreviations
    'ICA', 'OV', 'FL', 'S2', 'S3',
    # Extra Renault/Opel trim
    'EXPRESSION', 'PRIVILEGE', 'AUTHENTIQUE', 'NIGHT', 'EXTREME', 'INTENSE',
    'LAUNCH', 'ANNIVERSARY', 'NEWLINE', 'SCOUT',
    # Peugeot/Citroen trim
    'ALLURE', 'ACCESS', 'FEEL', 'SHINE',
    # Volkswagen
    'TRENDLINE', 'COMFORTLINE', 'HIGHLINE', 'SPORTLINE', 'BLUEMOTION',
    # BMW
    'URBAN', 'PURE', 'ADVANTAGE', 'SPORT', 'LUXURY',
    # BMW drivetrain / body descriptors
    'XDRIVE', 'SDRIVE', 'EDRIVE', 'IDRIVE', 'MHEV',
    # Hyundai trim / variant
    'TROY', 'STAR', 'ERA', 'PRIME', 'COMFORT', 'CRDI',
    # Generic
    'CIFT', 'KABIN', 'GRACE', 'SPACE', 'MULTIWAY', 'YUKSEK', 'TAVAN',
])

ENGINE_DISP_RE = re.compile(r'^\d+\.\d+')  # matches 1.6, 1.0T, 1.0T-GDI etc.

DIESEL_KW = [
    'M.JET','MJET','HDI','TDI','TDCI','CDTI','DCI','D-4D','D4D',
    'BLUEHDCI','BLUEHDI','JTDM','DURATORQ','MULTIJET','CRDI','DOHC D',
    'DTH','DTI','SDI','TDE','DIESEL','D3','D4','D5',
]
PETROL_KW = [
    'FIRE','VTEC','TFSI','TSI','GDI','MPI','VTI','ECOBOOST','ECO BOOST',
    'MULTIAIR','FIREFLY','TURBO','T-GDI','TGDI','MFI','MPFI','BENZIN',
    'NATURAL POWER','BIFUEL','LPG','PURETECH','VVTI','VVT-I','SPRIT',
    'E-TORQ','ETORQ','VALVEMATIC','16V','16 V',
]

def normalize_brand(adi):
    adi_upper = adi.strip().upper()
    return BRAND_MAP.get(adi_upper, adi_upper)

def slugify(text):
    text = text.lower().strip()
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def make_unique_slug(base_slug, existing_slugs):
    slug = base_slug
    i = 2
    while slug in existing_slugs:
        slug = f"{base_slug}-{i}"
        i += 1
    existing_slugs.add(slug)
    return slug

def fix_encoding_artifacts(text):
    """Fix common Source C encoding artifacts in model names."""
    replacements = {
        '▌20': 'i20',
        '▌30': 'i30',
        '▌10': 'i10',
        '▌40': 'i40',
        '▌': 'i',  # catch-all for broken lowercase 'i'
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    return text

# ────────────────────────────────────────────────
# Step 1: Parse Source C SQL
# ────────────────────────────────────────────────
def parse_sql(filepath):
    """Parse all INSERT blocks from MySQL dump, de-duplicate by natural key."""
    # Try UTF-8 first, fall back to latin-1 for encoding artifacts
    try:
        content = Path(filepath).read_text(encoding='utf-8', errors='replace')
    except Exception:
        content = Path(filepath).read_text(encoding='latin-1', errors='replace')

    # Apply encoding artifact fixes
    content = fix_encoding_artifacts(content)

    def parse_values(block):
        """Extract row tuples from a MySQL VALUES block.
        Handles quoted strings that may contain parentheses, commas, escape sequences.
        """
        rows = []
        i = 0
        n = len(block)

        while i < n:
            # Skip to next '('
            while i < n and block[i] != '(':
                i += 1
            if i >= n:
                break
            i += 1  # skip '('

            # Now parse fields until matching ')'
            parts = []
            current = ''
            in_str = False
            paren_depth = 0  # track nested parens inside values

            while i < n:
                ch = block[i]

                if in_str:
                    if ch == '\\' and i + 1 < n:
                        # escape sequence
                        current += ch + block[i + 1]
                        i += 2
                        continue
                    elif ch == "'":
                        # Could be end of string or escaped '' (MySQL-style)
                        if i + 1 < n and block[i + 1] == "'":
                            current += "''"
                            i += 2
                            continue
                        else:
                            in_str = False
                            current += ch
                    else:
                        current += ch
                else:
                    if ch == "'":
                        in_str = True
                        current += ch
                    elif ch == '(':
                        paren_depth += 1
                        current += ch
                    elif ch == ')':
                        if paren_depth > 0:
                            paren_depth -= 1
                            current += ch
                        else:
                            # End of row
                            parts.append(current.strip())
                            rows.append(parts)
                            i += 1
                            break
                    elif ch == ',' and paren_depth == 0:
                        parts.append(current.strip())
                        current = ''
                    else:
                        current += ch
                i += 1

        return rows

    def clean_val(v):
        v = v.strip()
        if v.upper() == 'NULL':
            return None
        if v.startswith("'") and v.endswith("'"):
            v = v[1:-1]
            v = v.replace("\\'", "'").replace('\\\\', '\\')
        return v

    # Find all INSERT INTO blocks
    insert_pat = re.compile(
        r"INSERT INTO `(arac_markalar|arac_modeller|arac_model_yillari)`[^V]*VALUES\s*([\s\S]+?)(?:;|\Z)",
        re.IGNORECASE
    )

    markalar = {}    # marka_kodu -> {id, marka_kodu, adi}
    modeller = {}    # (marka_kodu, model_kodu) -> {global_id, model_kodu, marka_kodu, adi}
    yillari  = {}    # model_kodu -> set of year strings

    raw_modeller_rows = []
    raw_yillari_rows = []

    for m in insert_pat.finditer(content):
        table = m.group(1).lower()
        vals_block = m.group(2)
        rows = parse_values(vals_block)
        for row in rows:
            if len(row) < 3:
                continue
            cols = [clean_val(c) for c in row]
            try:
                if table == 'arac_markalar' and len(cols) >= 3:
                    rec = {'id': cols[0], 'marka_kodu': int(cols[1]) if cols[1] else None, 'adi': cols[2] or ''}
                    key = rec['marka_kodu']
                    if key and key not in markalar:
                        markalar[key] = rec
                elif table == 'arac_modeller' and len(cols) >= 4:
                    raw_modeller_rows.append(cols)
                elif table == 'arac_model_yillari' and len(cols) >= 3:
                    raw_yillari_rows.append(cols)
            except (ValueError, TypeError, IndexError):
                continue

    # Process modeller: dedup by (marka_kodu, model_kodu)
    for cols in raw_modeller_rows:
        try:
            model_kodu = int(cols[1]) if cols[1] else None
            marka_kodu = int(cols[2]) if cols[2] else None
            adi = cols[3] or ''
            if not model_kodu or not marka_kodu:
                continue
            key = (marka_kodu, model_kodu)
            if key not in modeller:
                global_id = marka_kodu * 100000 + model_kodu
                modeller[key] = {
                    'global_id': global_id,
                    'model_kodu': model_kodu,
                    'marka_kodu': marka_kodu,
                    'adi': adi
                }
        except (ValueError, TypeError, IndexError):
            continue

    # Process yillari: keyed by model_kodu (int)
    for cols in raw_yillari_rows:
        try:
            model_kodu = int(cols[1]) if cols[1] else None
            year_adi = cols[2] or ''
            if model_kodu and year_adi:
                yillari.setdefault(model_kodu, set()).add(year_adi)
        except (ValueError, TypeError, IndexError):
            continue

    total_year_entries = sum(len(v) for v in yillari.values())
    print(f"[Source C raw] Brands: {len(markalar)}, Models: {len(modeller)}, Year entries: {total_year_entries}")
    return list(markalar.values()), list(modeller.values()), yillari

# ────────────────────────────────────────────────
# Step 2: Apply Turkey filter
# ────────────────────────────────────────────────
def apply_turkey_filter(markalar, modeller, yillari_dict):
    def get_years(model_kodu):
        raw = yillari_dict.get(model_kodu, set())
        years = []
        for y in raw:
            try:
                years.append(int(y))
            except (ValueError, TypeError):
                pass
        return sorted(years)

    # Filter brands
    filtered_marks = {}
    for m in markalar:
        normalized = normalize_brand(m['adi'])
        if normalized in INCLUDE_BRANDS:
            filtered_marks[m['marka_kodu']] = {**m, 'normalized_name': normalized}

    # Filter models
    def should_exclude(adi):
        adi_up = adi.upper()
        # Check always-keep first
        for kw in ALWAYS_KEEP_SUBSTRINGS:
            if kw in adi_up:
                return False
        for pat in EXCLUDE_PATTERNS:
            if re.search(pat, adi_up):
                return True
        return False

    filtered_models = []
    for model in modeller:
        if model['marka_kodu'] not in filtered_marks:
            continue
        if should_exclude(model['adi']):
            continue
        # Year filter: at least one year >= 1995
        years = get_years(model['model_kodu'])
        if years and max(years) < 1995:
            continue
        filtered_models.append({**model, 'years': years})

    total_year_entries = sum(len(get_years(m['model_kodu'])) for m in filtered_models)
    print(f"[After TR filter] Brands: {len(filtered_marks)}, Models: {len(filtered_models)}, Year entries: {total_year_entries}")

    # Sample
    print("\n[Sample 10 filtered models]")
    for m in filtered_models[:10]:
        brand = filtered_marks[m['marka_kodu']]['normalized_name']
        print(f"  [{brand}] {m['adi']}  years={m['years'][:5]}")

    return filtered_marks, filtered_models, yillari_dict

# ────────────────────────────────────────────────
# Step 3: Extract base model name (NEW)
# ────────────────────────────────────────────────
def extract_base_model_name(adi_upper, brand_normalized):
    """
    Extract the base model name from a Source C adi string.

    Strategy: scan tokens left-to-right, stop at the first body/trim/stop token,
    engine displacement pattern, or standalone digit.

    The key insight: VehicleModel is the base model name only. All body/trim
    variants of the same base model share ONE VehicleModel record.

    Examples:
      'EGEA SEDAN URBAN 1.6 M.JET 120' -> 'EGEA'
      'EGEA HB EASY PLUS 1.4 FIRE 95'  -> 'EGEA'
      'CLIO GRAND TOUR AUTHENTIQUE 1.5' -> 'CLIO'
      'LINEA ACTUAL 1.4 FIRE 77'        -> 'LINEA'
      'DOBLO COMBI 1.6 90 MJET'         -> 'DOBLO'
      'MEGANE III HB DYNAMIQUE 1.5'     -> 'MEGANE III'
      'B-MAX TITANIUM X'                -> 'B-MAX'
    """
    # Strip leading 'MY ' prefix (model-year marker used in Source C)
    if adi_upper.startswith('MY '):
        adi_upper = adi_upper[3:].strip()
        if not adi_upper:
            return 'MY'

    # Brand-specific pre-normalization
    # FIAT: PAN.PREMIO, PAN. → DOBLO body variant → already has DOBLO prefix
    adi_upper = re.sub(r'\bPAN\.PREMIO\b', 'PANORAMA', adi_upper)
    adi_upper = re.sub(r'\bPAN\.\b', 'PANORAMA', adi_upper)
    # FIAT: G. PUNTO, G.PUNTO → GRANDE PUNTO
    adi_upper = re.sub(r'\bG\.?\s*PUNTO\b', 'GRANDE PUNTO', adi_upper)

    tokens = adi_upper.split()
    result_tokens = []

    # Check multi-word stops first (before scanning individual tokens)
    # Replace multi-word body markers so they appear as single token for scanning
    work = adi_upper
    for mw in BODY_MARKERS_MULTIWORD:
        work = re.sub(r'\b' + re.escape(mw) + r'\b', mw.replace(' ', '_'), work)
    tokens = work.split()

    # Build set of underscored multiword markers for quick lookup
    _multiword_underscored = {mw.replace(' ', '_') for mw in BODY_MARKERS_MULTIWORD}
    _multiword_set = set(BODY_MARKERS_MULTIWORD)

    for token in tokens:
        # Restore underscored multi-word tokens for checking
        check_token = token.replace('_', ' ')
        # Check against single-token stop words (space-restored)
        if check_token in ALL_STOP_TOKENS or token in ALL_STOP_TOKENS:
            break
        # Check against multi-word body markers (both underscore and space forms)
        if token in _multiword_underscored or check_token in _multiword_set:
            break
        # Stop at engine displacement pattern (e.g. 1.6, 2.0, 1.0T, 1.6T-GDI)
        if ENGINE_DISP_RE.match(token):
            break
        # Stop at standalone digit (HP or year values)
        if token.isdigit() and int(token) < 10000:
            break
        # Stop at parenthesized number e.g. (95), (120)
        if re.match(r'^\(\d+\)$', token):
            break
        # Stop at token that starts with a body marker concatenated with digits (e.g. GRANCOUPE1.5)
        for bm in BODY_MARKERS_SINGLE + [mw.replace(' ', '') for mw in BODY_MARKERS_MULTIWORD]:
            if token.startswith(bm) and len(token) > len(bm):
                result_tokens_break = True
                break
        else:
            result_tokens_break = False
        if result_tokens_break:
            break
        result_tokens.append(token)

    model = ' '.join(result_tokens).strip()
    if not model:
        # Fallback: use first token
        return adi_upper.split()[0] if adi_upper.split() else adi_upper

    return model


def extract_body_type(adi_upper, base_model_name):
    """
    Extract body type from adi string, given the already-extracted base model name.
    Looks for body type markers after the base model name portion.

    Returns canonical body type string (e.g. 'HB', 'SEDAN', 'SW', 'CARGO') or None.
    """
    # Work on the string after the base model name
    # Find where base model ends in the adi string
    base_end = len(base_model_name)
    # adi_upper might not start with base_model exactly due to tokenization
    # so search for the remaining part
    remaining = adi_upper[base_end:].strip() if adi_upper.startswith(base_model_name) else adi_upper

    # Prepare: replace multi-word markers with placeholders for detection
    work = remaining
    for mw in sorted(BODY_MARKERS_MULTIWORD, key=len, reverse=True):
        if mw in work:
            return BODY_NORMALIZE.get(mw, mw)

    # Check single-word markers in order of specificity
    for bt in BODY_MARKERS_SINGLE:
        pat = r'(?<!\w)' + re.escape(bt) + r'(?!\w)'
        if re.search(pat, work):
            return BODY_NORMALIZE.get(bt, bt)

    # No body type found
    return None


# ────────────────────────────────────────────────
# Step 4: Parse engine specs from adi string
# ────────────────────────────────────────────────
def parse_engine_specs(adi_upper):
    """
    Parse engine displacement, HP, fuel type, and transmission from adi string.
    Returns (displacement_cc, hp, fuel_type, transmission)
    """
    # Displacement: first X.X pattern
    displacement_cc = None
    disp_match = re.search(r'(\d+\.\d+)', adi_upper)
    if disp_match:
        try:
            displacement_cc = int(float(disp_match.group(1)) * 1000)
        except (ValueError, TypeError):
            pass

    # HP: look for 2-3 digit numbers in plausible HP range
    # Typically appears after displacement value
    hp = None
    # Try parenthesized HP first: (95), (110), (120)
    paren_hp = re.findall(r'\((\d{2,3})\)', adi_upper)
    for ph in paren_hp:
        v = int(ph)
        if 50 <= v <= 600:
            hp = v
            break

    if not hp:
        # Find all 2-4 digit numbers, pick the one most likely to be HP (50-600)
        hp_candidates = re.findall(r'\b(\d{2,4})\b', adi_upper)
        for hm in hp_candidates:
            v = int(hm)
            # Skip displacement integers (1000-3500 range when they are round)
            if displacement_cc and abs(v - displacement_cc) < 50:
                continue
            # Skip year-like values
            if 1990 <= v <= 2030:
                continue
            # Skip emission standards (E3, E4, E5, E6 are filtered below)
            if 50 <= v <= 600:
                hp = v
                break

    # Fuel type
    fuel_type = None
    for kw in DIESEL_KW:
        if kw in adi_upper:
            fuel_type = 'Diesel'
            break
    if not fuel_type:
        for kw in PETROL_KW:
            if kw in adi_upper:
                fuel_type = 'Gasoline'
                break

    # Transmission
    transmission = None
    trans_m = re.search(r'\b(\d*MT|\d*AT|DCT|CVT|AMT|DSG|EDC|EAT[678]?|PDK|E-CVT)\b', adi_upper)
    if trans_m:
        transmission = trans_m.group(1)

    return displacement_cc, hp, fuel_type, transmission


# ────────────────────────────────────────────────
# Step 5: Load Source A and build lookup
# ────────────────────────────────────────────────
def load_source_a():
    with open(BRANDS_JSON) as f:
        src_brands = json.load(f)
    with open(AUTOS_JSON) as f:
        src_autos = json.load(f)
    with open(ENGINES_JSON) as f:
        src_engines = json.load(f)

    brand_map = {b['id']: b['name'].upper().strip() for b in src_brands}

    # engine lookup: auto_id -> [engine_spec_dicts]
    eng_by_auto = {}
    for e in src_engines:
        aid = e['automobile_id']
        eng_by_auto.setdefault(aid, []).append(e)

    # auto lookup: (brand_upper, model_name_upper_fragment) -> [auto_id]
    auto_index = {}
    for a in src_autos:
        b_id = a['brand_id']
        brand_name = brand_map.get(b_id, '')
        name_clean = re.sub(r'\s+', ' ', a['name']).strip()
        model_part = re.sub(r'^[A-Z\s]+\s+', '', name_clean, count=1)
        model_part = re.sub(r'\s+\d{4}.*$', '', model_part).strip().upper()
        key = (brand_name, model_part[:20])
        auto_index.setdefault(key, []).append(a['id'])

    return brand_map, auto_index, eng_by_auto

def find_source_a_engine(brand_normalized, model_name, displacement_cc, hp, fuel_type, brand_map, auto_index, eng_by_auto):
    """Try to match a Source A engine. Returns dict with extra specs or None."""
    if not displacement_cc:
        return None

    src_a_brand = brand_normalized.upper()
    brand_aliases = {
        'MERCEDES-BENZ': 'MERCEDES-BENZ',
        'CITROEN': 'CITROËN',
    }
    src_a_brand = brand_aliases.get(src_a_brand, src_a_brand)

    model_prefix = model_name[:20] if model_name else ''
    matched_auto_ids = []
    for length in [20, 15, 10, 8, 6, 4]:
        prefix = model_prefix[:length]
        for (b, m), ids in auto_index.items():
            if b == src_a_brand and m.startswith(prefix) and prefix:
                matched_auto_ids.extend(ids)
        if matched_auto_ids:
            break

    if not matched_auto_ids:
        return None

    best_match = None
    best_score = 999

    for auto_id in matched_auto_ids:
        for eng in eng_by_auto.get(auto_id, []):
            specs = eng.get('specs', {})
            eng_specs = specs.get('Engine Specs', {})

            disp_str = eng_specs.get('Displacement:', '') or ''
            disp_m = re.search(r'(\d+)\s*[Cc][Mm]3', disp_str)
            if not disp_m:
                continue
            src_disp = int(disp_m.group(1))

            if abs(src_disp - displacement_cc) > 100:
                continue

            power_str = eng_specs.get('Power:', '') or ''
            src_hp = None
            hp_m = re.search(r'(\d+)\s*[Hh][Pp]', power_str)
            if hp_m:
                src_hp = int(hp_m.group(1))

            fuel_str = (eng_specs.get('Fuel:', '') or '').lower()
            src_fuel = 'Diesel' if 'diesel' in fuel_str else ('Gasoline' if 'gasoline' in fuel_str or 'petrol' in fuel_str else None)

            score = 0
            if hp and src_hp:
                score += abs(hp - src_hp)
            if fuel_type and src_fuel and fuel_type != src_fuel:
                score += 100

            if score < best_score:
                best_score = score
                trans_specs = specs.get('Transmission Specs', {})
                gearbox_str = (trans_specs.get('Gearbox:', '') or '').strip()
                drive_str = (trans_specs.get('Drive Type:', '') or '').strip()

                torque_str = (eng_specs.get('Torque:', '') or '')
                torque_nm = None
                torq_m = re.search(r'(\d+)\s*[Nn][Mm]', torque_str)
                if torq_m:
                    torque_nm = int(torq_m.group(1))

                kw_val = None
                kw_m = re.search(r'(\d+(?:\.\d+)?)\s*[Kk][Ww]', power_str)
                if kw_m:
                    kw_val = int(float(kw_m.group(1)))

                best_match = {
                    'hp': src_hp or hp,
                    'kw': kw_val,
                    'displacement_cc': src_disp,
                    'fuel_type': src_fuel or fuel_type,
                    'gearbox': gearbox_str[:100] if gearbox_str else None,
                    'drivetrain': drive_str[:100] if drive_str else None,
                    'torque_nm': torque_nm,
                    'score': score,
                }

    if best_match and best_match['score'] < 15:
        return best_match
    return None

# ────────────────────────────────────────────────
# Step 6: Build hierarchical structure (REWRITTEN)
# ────────────────────────────────────────────────
def build_catalog(filtered_marks, filtered_models, yillari_dict, brand_map, auto_index, eng_by_auto):
    """
    Groups Source C records into:
      Make -> Model (base name) -> Generation (body_type + year_range) -> Engine (unique engine spec)

    Key change from previous version:
      - base model name extracted via extract_base_model_name (stops at body/trim markers)
      - all body/trim variants of the same base model name share ONE VehicleModel
      - generation = base_model + body_type + year_range
    """
    def get_years_set(model_kodu):
        raw = yillari_dict.get(model_kodu, set())
        years = set()
        for y in raw:
            try:
                years.add(int(y))
            except (ValueError, TypeError):
                pass
        return years

    year_map = {m['model_kodu']: get_years_set(m['model_kodu']) for m in filtered_models}

    models_by_brand = {}
    for m in filtered_models:
        models_by_brand.setdefault(m['marka_kodu'], []).append(m)

    catalog = []

    for _make_idx, (marka_kodu, mark_rec) in enumerate(filtered_marks.items(), start=1):
        brand_name = mark_rec['normalized_name']
        brand_models = models_by_brand.get(marka_kodu, [])
        if not brand_models:
            continue

        # Group by base_model_name (NEW grouping logic)
        # key: base_model_name (str) -> list of variant dicts
        model_groups = {}

        for m in brand_models:
            adi_up = m['adi'].strip().upper()
            base_model = extract_base_model_name(adi_up, brand_name)
            body_type = extract_body_type(adi_up, base_model)
            disp, hp, fuel, trans = parse_engine_specs(adi_up)

            years = sorted(year_map.get(m['model_kodu'], set()))
            model_groups.setdefault(base_model, []).append({
                'body_type': body_type,
                'displacement_cc': disp,
                'hp': hp,
                'fuel_type': fuel,
                'transmission': trans,
                'years': years,
                'adi': m['adi'],
                'model_kodu': m['model_kodu'],
            })

        make_entry = {
            'marka_kodu': marka_kodu,
            '_make_idx': _make_idx,
            'name': brand_name,
            'models': []
        }

        for model_name, variants in model_groups.items():
            # Group variants into generations: (body_type, year_range)
            # Generation = unique body_type + year range (merge if overlapping/adjacent within 3yr)
            gen_groups = {}  # (body_type, year_from, year_to) -> [variant]

            for v in variants:
                bt = v['body_type'] or ''
                years = v['years']
                yf = min(years) if years else None
                yt = max(years) if years else None

                placed = False
                for gkey in list(gen_groups.keys()):
                    gbt, gyf, gyt = gkey
                    if gbt == bt:
                        if yf and yt and gyf and gyt:
                            if not (yt < gyf - 3 or yf > gyt + 3):
                                # Merge year range
                                new_yf = min(gyf, yf)
                                new_yt = max(gyt, yt)
                                gen_groups[(gbt, new_yf, new_yt)] = gen_groups.pop(gkey) + [v]
                                placed = True
                                break
                        elif not gyf and not gyt:
                            gen_groups[gkey].append(v)
                            placed = True
                            break
                if not placed:
                    gen_groups[(bt, yf, yt)] = [v]

            generations = []
            for (bt, yf, yt), gen_variants in gen_groups.items():
                # Collect unique engine specs within this generation
                engine_specs = {}
                for v in gen_variants:
                    src_a = None
                    if v['displacement_cc']:
                        src_a = find_source_a_engine(
                            brand_name, model_name,
                            v['displacement_cc'], v['hp'], v['fuel_type'],
                            brand_map, auto_index, eng_by_auto
                        )

                    hp_final = (src_a['hp'] if src_a else None) or v['hp']
                    kw_final = src_a['kw'] if src_a else None
                    if kw_final is None and hp_final:
                        kw_final = int(hp_final * 0.7457)
                    fuel_final = (src_a['fuel_type'] if src_a else None) or v['fuel_type']
                    disp_final = (src_a['displacement_cc'] if src_a else None) or v['displacement_cc']
                    gear_final = src_a['gearbox'] if src_a else None
                    drive_final = src_a['drivetrain'] if src_a else None
                    trans_final = v['transmission']

                    # Build engine display name
                    disp_str = f"{disp_final/1000:.1f}L" if disp_final else ''
                    hp_str = f"{hp_final}HP" if hp_final else ''
                    fuel_str = fuel_final or ''
                    trans_str = trans_final or ''
                    eng_name_parts = [p for p in [disp_str, fuel_str, hp_str, trans_str] if p]
                    eng_name = ' '.join(eng_name_parts) if eng_name_parts else v['adi'][:80]
                    eng_name = eng_name[:200]

                    # De-duplicate engines: key by displacement+hp+fuel+transmission
                    ekey = (disp_final, hp_final, fuel_final, trans_final)
                    if ekey not in engine_specs:
                        engine_specs[ekey] = {
                            'name': eng_name,
                            'displacement_cc': disp_final,
                            'power_hp': hp_final,
                            'power_kw': kw_final,
                            'fuel_type': fuel_final,
                            'gearbox': gear_final or trans_final,
                            'drivetrain': drive_final,
                        }

                # Build generation display name: "BaseModel BodyType (year_from-year_to)"
                gen_name_parts = [model_name]
                if bt:
                    # Use normalized body type name
                    bt_display = bt.replace('_', ' ').title()
                    gen_name_parts.append(bt_display)
                if yf:
                    if yt and yt != yf:
                        gen_name_parts.append(f"({yf}-{yt})")
                    else:
                        gen_name_parts.append(f"({yf})")
                gen_display = ' '.join(gen_name_parts)

                generations.append({
                    'name': gen_display,
                    'body_type': bt or None,
                    'year_from': yf,
                    'year_to': yt,
                    'engines': list(engine_specs.values()),
                })

            make_entry['models'].append({
                'name': model_name,
                'generations': generations,
            })

        catalog.append(make_entry)

    return catalog

# ────────────────────────────────────────────────
# Step 7: DB import (idempotent upsert)
# ────────────────────────────────────────────────
def import_to_db(catalog, conn):
    cur = conn.cursor()

    # Find engine IDs referenced by product compatibility — DO NOT DELETE
    cur.execute('SELECT "VehicleEngineId" FROM "ProductVehicleCompatibilities"')
    protected_engine_ids = {row[0] for row in cur.fetchall()}
    print(f"[DB] Protected engine IDs (compat): {len(protected_engine_ids)}")

    # Clean up ALL old vehicle data safely
    print("[DB] Cleaning old vehicle records (full cleanup)...")

    if protected_engine_ids:
        ids_str = ','.join(f"'{str(eid)}'" for eid in protected_engine_ids)
        cur.execute(f'DELETE FROM "VehicleEngines" WHERE "Id" NOT IN ({ids_str})')
    else:
        cur.execute('DELETE FROM "VehicleEngines"')
    print(f"  Deleted old engines: {cur.rowcount}")

    cur.execute('''
        DELETE FROM "VehicleGenerations"
        WHERE "Id" NOT IN (SELECT "VehicleGenerationId" FROM "VehicleEngines")
    ''')
    print(f"  Deleted old generations: {cur.rowcount}")

    cur.execute('''
        DELETE FROM "VehicleModels"
        WHERE "Id" NOT IN (SELECT "VehicleModelId" FROM "VehicleGenerations")
    ''')
    print(f"  Deleted old models: {cur.rowcount}")

    cur.execute('''
        DELETE FROM "VehicleMakes"
        WHERE "Id" NOT IN (SELECT "VehicleMakeId" FROM "VehicleModels")
    ''')
    print(f"  Deleted old makes: {cur.rowcount}")

    conn.commit()
    print("[DB] Cleanup committed.")

    # Now insert new catalog
    make_slugs = set()
    cur.execute('SELECT "Slug" FROM "VehicleMakes"')
    for row in cur.fetchall():
        make_slugs.add(row[0])

    make_name_to_id = {}
    cur.execute('SELECT "Id","Name" FROM "VehicleMakes" WHERE "ExternalId" IS NOT NULL')
    for row in cur.fetchall():
        make_name_to_id[row[1]] = row[0]

    total_makes = total_models = total_gens = total_engines = 0

    for make_entry in catalog:
        brand_name = make_entry['name']
        marka_kodu = make_entry['marka_kodu']

        if brand_name in make_name_to_id:
            make_id = make_name_to_id[brand_name]
        else:
            brand_slug = make_unique_slug(slugify(brand_name), make_slugs)
            cur.execute('''
                INSERT INTO "VehicleMakes" ("Id","Name","Slug","IsActive","ExternalId","CreatedAt","UpdatedAt")
                VALUES (gen_random_uuid(), %s, %s, true, %s, NOW(), NOW())
                ON CONFLICT ("ExternalId") DO UPDATE SET
                    "Name" = EXCLUDED."Name",
                    "UpdatedAt" = NOW()
                RETURNING "Id"
            ''', (brand_name, brand_slug, marka_kodu))
            make_row = cur.fetchone()
            if not make_row:
                cur.execute('SELECT "Id" FROM "VehicleMakes" WHERE "ExternalId" = %s', (marka_kodu,))
                make_row = cur.fetchone()
            make_id = make_row[0]
            make_name_to_id[brand_name] = make_id
            total_makes += 1

        model_slugs = set()
        # Build a name->id map for existing models for this make (for dedup by natural key)
        model_name_to_id = {}
        cur.execute('SELECT "Id","Name","Slug" FROM "VehicleModels" WHERE "VehicleMakeId" = %s', (make_id,))
        for row in cur.fetchall():
            model_slugs.add(row[2])
            model_name_to_id[row[1]] = row[0]

        for mi, model_entry in enumerate(make_entry['models']):
            model_name = model_entry['name']

            # Natural key dedup: if a model with same name already exists for this make, reuse it
            if model_name in model_name_to_id:
                model_id = model_name_to_id[model_name]
                # Still process generations/engines for this model
            else:
                # Compact external IDs: make_idx (1-99) * 100000 + model_index (0-999)
                model_ext_id = make_entry['_make_idx'] * 100000 + mi
                model_slug = make_unique_slug(slugify(f"{brand_name}-{model_name}"), model_slugs)

                cur.execute('''
                    INSERT INTO "VehicleModels" ("Id","Name","Slug","VehicleMakeId","ExternalId","CreatedAt","UpdatedAt")
                    VALUES (gen_random_uuid(), %s, %s, %s, %s, NOW(), NOW())
                    ON CONFLICT ("ExternalId") DO UPDATE SET
                        "Name" = EXCLUDED."Name",
                        "UpdatedAt" = NOW()
                    RETURNING "Id"
                ''', (model_name, model_slug, make_id, model_ext_id))
                model_row = cur.fetchone()
                if not model_row:
                    cur.execute('SELECT "Id" FROM "VehicleModels" WHERE "ExternalId" = %s', (model_ext_id,))
                    model_row = cur.fetchone()
                model_id = model_row[0]
                model_name_to_id[model_name] = model_id
                total_models += 1

            # Build gen natural key map for this model
            gen_key_to_id = {}
            cur.execute('''
                SELECT "Id","Name","BodyType","YearFrom","YearTo"
                FROM "VehicleGenerations" WHERE "VehicleModelId" = %s
            ''', (model_id,))
            for row in cur.fetchall():
                gkey = (row[1], row[2], row[3], row[4])
                gen_key_to_id[gkey] = row[0]

            for gi, gen_entry in enumerate(model_entry['generations']):
                gen_ext_id = make_entry['_make_idx'] * 10000000 + mi * 10000 + gi * 100
                gen_name = gen_entry['name']

                # Natural key dedup for generations
                gen_nat_key = (gen_name, gen_entry['body_type'], gen_entry['year_from'], gen_entry['year_to'])
                if gen_nat_key in gen_key_to_id:
                    gen_id = gen_key_to_id[gen_nat_key]
                else:
                    gen_slug = slugify(f"{brand_name}-{model_name}-{gen_name}-{gi}")

                    cur.execute('''
                        INSERT INTO "VehicleGenerations"
                        ("Id","Name","Slug","VehicleModelId","YearFrom","YearTo","BodyType","ExternalId","CreatedAt","UpdatedAt")
                        VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                        ON CONFLICT ("ExternalId") DO UPDATE SET
                            "Name" = EXCLUDED."Name",
                            "YearFrom" = EXCLUDED."YearFrom",
                            "YearTo" = EXCLUDED."YearTo",
                            "BodyType" = EXCLUDED."BodyType",
                            "UpdatedAt" = NOW()
                        RETURNING "Id"
                    ''', (
                        gen_name, gen_slug, model_id,
                        gen_entry['year_from'], gen_entry['year_to'],
                        gen_entry['body_type'], gen_ext_id
                    ))
                    gen_row = cur.fetchone()
                    if not gen_row:
                        cur.execute('SELECT "Id" FROM "VehicleGenerations" WHERE "ExternalId" = %s', (gen_ext_id,))
                        gen_row = cur.fetchone()
                    gen_id = gen_row[0]
                    gen_key_to_id[gen_nat_key] = gen_id
                    total_gens += 1

                # Build engine natural key map for this generation
                eng_key_to_id = {}
                cur.execute('''
                    SELECT "Id","DisplacementCc","FuelType","PowerHp","Gearbox"
                    FROM "VehicleEngines" WHERE "VehicleGenerationId" = %s
                ''', (gen_id,))
                for row in cur.fetchall():
                    ekey = (row[1], row[2], row[3], row[4])
                    eng_key_to_id[ekey] = row[0]

                for ei, eng_entry in enumerate(gen_entry['engines']):
                    eng_ext_id = gen_ext_id + ei + 1
                    eng_name = eng_entry['name']

                    # Natural key dedup for engines
                    eng_nat_key = (
                        eng_entry['displacement_cc'],
                        eng_entry['fuel_type'],
                        eng_entry['power_hp'],
                        eng_entry.get('gearbox'),
                    )
                    if eng_nat_key in eng_key_to_id:
                        continue  # already exists, skip

                    eng_slug = slugify(f"{brand_name}-{model_name}-{eng_name}-{eng_ext_id}")[:200]

                    disp_str = None
                    if eng_entry['displacement_cc']:
                        disp_str = f"{eng_entry['displacement_cc']/1000:.1f}L"

                    cur.execute('''
                        INSERT INTO "VehicleEngines"
                        ("Id","Name","VehicleGenerationId","Displacement","DisplacementCc","FuelType",
                         "PowerHp","PowerKw","Gearbox","Drivetrain","ExternalId","CreatedAt","UpdatedAt")
                        VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                        ON CONFLICT ("ExternalId") DO UPDATE SET
                            "Name" = EXCLUDED."Name",
                            "UpdatedAt" = NOW()
                        RETURNING "Id"
                    ''', (
                        eng_name, gen_id,
                        disp_str,
                        eng_entry['displacement_cc'],
                        eng_entry['fuel_type'],
                        eng_entry['power_hp'],
                        eng_entry['power_kw'],
                        eng_entry['gearbox'],
                        eng_entry['drivetrain'],
                        eng_ext_id
                    ))
                    total_engines += 1

        # Commit every make for progress
        conn.commit()
        print(f"  Imported make: {brand_name} ({len(make_entry['models'])} models)")

    print(f"\n[DB Import complete]")
    print(f"  Makes:       {total_makes}")
    print(f"  Models:      {total_models}")
    print(f"  Generations: {total_gens}")
    print(f"  Engines:     {total_engines}")

    # Verify compat still intact
    cur.execute('SELECT COUNT(*) FROM "ProductVehicleCompatibilities"')
    compat_count = cur.fetchone()[0]
    print(f"  ProductVehicleCompatibilities: {compat_count} (should be unchanged)")

    # Final counts
    cur.execute('SELECT COUNT(*) FROM "VehicleMakes"')
    print(f"  Final VehicleMakes: {cur.fetchone()[0]}")
    cur.execute('SELECT COUNT(*) FROM "VehicleModels"')
    print(f"  Final VehicleModels: {cur.fetchone()[0]}")
    cur.execute('SELECT COUNT(*) FROM "VehicleGenerations"')
    print(f"  Final VehicleGenerations: {cur.fetchone()[0]}")
    cur.execute('SELECT COUNT(*) FROM "VehicleEngines"')
    print(f"  Final VehicleEngines: {cur.fetchone()[0]}")

# ────────────────────────────────────────────────
# Main
# ────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("Akinel Turkey Vehicle Catalog Importer")
    print("=" * 60)

    # Step 1: Parse SQL
    print("\n[Step 1] Parsing Source C SQL...")
    markalar, modeller, yillari = parse_sql(SQL_FILE)

    # Step 2: Apply filter
    print("\n[Step 2] Applying Turkey filter...")
    filtered_marks, filtered_models, filtered_years = apply_turkey_filter(markalar, modeller, yillari)

    # Step 3+4: Load Source A
    print("\n[Step 3] Loading Source A engine specs...")
    brand_map, auto_index, eng_by_auto = load_source_a()
    print(f"  Loaded {len(brand_map)} brands, {sum(len(v) for v in eng_by_auto.values())} engines")

    # Step 5: Build catalog
    print("\n[Step 4] Building catalog hierarchy...")
    catalog = build_catalog(filtered_marks, filtered_models, filtered_years, brand_map, auto_index, eng_by_auto)

    total_m = sum(len(mk['models']) for mk in catalog)
    total_g = sum(len(mo['generations']) for mk in catalog for mo in mk['models'])
    total_e = sum(len(g['engines']) for mk in catalog for mo in mk['models'] for g in mo['generations'])
    print(f"  Catalog: {len(catalog)} makes, {total_m} models, {total_g} generations, {total_e} engines")

    # Print per-make model counts
    print("\n[Per-make model counts]")
    for mk in sorted(catalog, key=lambda x: len(x['models']), reverse=True):
        print(f"  {mk['name']}: {len(mk['models'])} models")

    # Step 6: DB import
    print("\n[Step 5] Connecting to database...")
    conn = psycopg2.connect(DB_DSN)
    try:
        import_to_db(catalog, conn)
    finally:
        conn.close()

    print("\n[Done]")

if __name__ == '__main__':
    main()
