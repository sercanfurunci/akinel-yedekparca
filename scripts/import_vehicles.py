#!/usr/bin/env python3
"""
Vehicle catalog import script.
Imports brands, automobile models, and engine variants from the automobile-models-and-specs dataset
into the Akinel PostgreSQL database.

Idempotent: safe to run multiple times. Uses ExternalId as upsert key.
"""

import json
import re
import sys
import uuid
import psycopg2
import psycopg2.extras
import psycopg2.extensions
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "akinel_db",
    "user": "akinel_user",
    "password": "akinel_pass",
}

DATA_DIR = "/tmp/automobile-dataset"
BRANDS_FILE = f"{DATA_DIR}/brands.json"
AUTOMOBILES_FILE = f"{DATA_DIR}/automobiles.json"
ENGINES_FILE = f"{DATA_DIR}/engines.json"

# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def normalize_brand(name: str) -> str:
    special = {
        "mercedes-amg": "Mercedes-AMG",
        "bmw": "BMW",
        "mg": "MG",
        "gmc": "GMC",
        "ram trucks": "RAM Trucks",
        "fiat": "FIAT",
        "seat": "SEAT",
        "skoda": "Škoda",
    }
    lower = name.lower().strip()
    if lower in special:
        return special[lower]
    return name.strip().title()


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    text = text.lower().strip()
    # Replace special chars and spaces with hyphens
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def parse_automobile_name(raw_name: str, brand_name: str):
    """
    Parse an automobile record name string.
    Returns (model_name, generation_name, year_from, year_to, body_style)
    """
    # 1. Strip HTML entities
    name = raw_name.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    # 2. Strip "Photos, engines & full specs" suffix
    name = re.sub(r"\s*Photos.*$", "", name, flags=re.IGNORECASE).strip()
    name = name.strip()

    # 4. Extract year range — format "YYYY-YYYY" or "YYYY-Present"
    year_from = None
    year_to = None
    year_match = re.search(r"(\d{4})-(\d{4}|[Pp]resent)", name)
    if year_match:
        year_from = int(year_match.group(1))
        year_to = None if year_match.group(2).lower() == "present" else int(year_match.group(2))
        name = name[: year_match.start()].strip() + " " + name[year_match.end() :].strip()
        name = name.strip()
    else:
        # Format "YYYY ModelName" prefix
        year_prefix = re.match(r"^(\d{4})\s+(.+)", name)
        if year_prefix:
            year_from = int(year_prefix.group(1))
            name = year_prefix.group(2).strip()

    # 5. Strip brand prefix from name (case-insensitive)
    name_upper = name.upper()
    brand_upper = brand_name.upper()
    if name_upper.startswith(brand_upper):
        name = name[len(brand_name) :].strip()

    # 6. Extract body style keywords
    body_keywords = [
        "5 Doors", "3 Doors", "4 Doors", "Station Wagon", "Wagon", "Cabrio",
        "Convertible", "Coupe", "Sedan", "SUV", "Hatchback", "Van", "Pickup",
        "Estate", "Roadster", "Cross", "Spyder", "Targa",
    ]
    body_style = None
    for kw in body_keywords:
        if kw.lower() in name.lower():
            body_style = kw
            break

    # 7. Derive base model name: strip body style and year leftovers
    model_name = name.strip()
    if body_style:
        model_name = re.sub(re.escape(body_style), "", model_name, flags=re.IGNORECASE).strip()
    model_name = re.sub(r"\s{2,}", " ", model_name).strip()

    # Clean up stray hyphens at start/end
    model_name = model_name.strip("- ").strip()
    if not model_name:
        model_name = name.strip()

    # Generation name: full parsed name (with body style, without year)
    gen_name = name.strip()
    if year_from:
        if year_to:
            gen_name = f"{gen_name} ({year_from}-{year_to})"
        else:
            gen_name = f"{gen_name} ({year_from}-Present)"

    return model_name, gen_name, year_from, year_to, body_style


def parse_engine_specs(engine_name: str, specs: dict) -> dict:
    result = {}

    engine_specs = specs.get("Engine Specs", {})
    transmission_specs = specs.get("Transmission Specs", {})

    # Displacement from specs
    disp_spec = engine_specs.get("Displacement:", "") or engine_specs.get("Displacement", "")
    if disp_spec:
        disp_match = re.search(r"(\d+)\s*[Cc]m3", disp_spec)
        if disp_match:
            result["displacement_cc"] = int(disp_match.group(1))

    # HP from specs Power field
    power_spec = engine_specs.get("Power:", "") or engine_specs.get("Power", "")
    if power_spec:
        hp_match = re.search(r"(\d+)\s*[Hh]p", power_spec)
        if hp_match:
            result["power_hp"] = int(hp_match.group(1))

    # Fuel type
    fuel = engine_specs.get("Fuel:", "") or engine_specs.get("Fuel", "")
    if fuel:
        result["fuel_type"] = fuel.strip()

    # Gearbox
    gearbox_spec = transmission_specs.get("Gearbox:", "") or transmission_specs.get("Gearbox", "")
    if gearbox_spec:
        result["gearbox"] = gearbox_spec.strip()[:100]

    # Drivetrain
    drive = transmission_specs.get("Drive Type:", "") or transmission_specs.get("Drive Type", "")
    if drive:
        result["drivetrain"] = drive.strip()

    return result


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def new_uuid() -> str:
    return str(uuid.uuid4())


def now_utc():
    return datetime.now(timezone.utc)


def get_or_create_make(cur, external_id: int, name: str, logo_url: str | None):
    """Upsert VehicleMake by ExternalId. Returns internal UUID."""
    cur.execute('SELECT "Id" FROM "VehicleMakes" WHERE "ExternalId" = %s', (external_id,))
    row = cur.fetchone()
    if row:
        # Update
        cur.execute(
            'UPDATE "VehicleMakes" SET "Name"=%s, "Slug"=%s, "LogoUrl"=%s, "UpdatedAt"=%s WHERE "ExternalId"=%s RETURNING "Id"',
            (name, slugify(name), logo_url, now_utc(), external_id),
        )
        return cur.fetchone()[0]
    else:
        new_id = new_uuid()
        cur.execute(
            'INSERT INTO "VehicleMakes" ("Id","Name","Slug","LogoUrl","IsActive","ExternalId","CreatedAt","UpdatedAt") VALUES (%s,%s,%s,%s,%s,%s,%s,%s)',
            (new_id, name, slugify(name), logo_url, True, external_id, now_utc(), now_utc()),
        )
        return new_id


def get_or_create_model(cur, make_internal_id, external_id: int, name: str):
    """Upsert VehicleModel by ExternalId. Returns (internal UUID, was_created)."""
    cur.execute('SELECT "Id" FROM "VehicleModels" WHERE "ExternalId" = %s', (external_id,))
    row = cur.fetchone()
    if row:
        cur.execute(
            'UPDATE "VehicleModels" SET "Name"=%s, "Slug"=%s, "VehicleMakeId"=%s, "UpdatedAt"=%s WHERE "ExternalId"=%s RETURNING "Id"',
            (name, slugify(name), make_internal_id, now_utc(), external_id),
        )
        return cur.fetchone()[0], False
    else:
        # Check if a model with the same name already exists for this make (dedup)
        cur.execute(
            'SELECT "Id" FROM "VehicleModels" WHERE "VehicleMakeId"=%s AND "Name"=%s AND "ExternalId" IS NULL',
            (make_internal_id, name),
        )
        existing = cur.fetchone()
        if existing:
            # Claim this external_id for it
            cur.execute(
                'UPDATE "VehicleModels" SET "ExternalId"=%s, "UpdatedAt"=%s WHERE "Id"=%s RETURNING "Id"',
                (external_id, now_utc(), existing[0]),
            )
            return cur.fetchone()[0], False

        new_id = new_uuid()
        # Handle slug uniqueness by appending make slug prefix
        base_slug = slugify(name)
        cur.execute('SELECT 1 FROM "VehicleModels" WHERE "Slug"=%s', (base_slug,))
        if cur.fetchone():
            # Append make_id portion to make unique
            base_slug = f"{base_slug}-{str(make_internal_id)[:8]}"
        cur.execute(
            'INSERT INTO "VehicleModels" ("Id","Name","Slug","VehicleMakeId","ExternalId","CreatedAt","UpdatedAt") VALUES (%s,%s,%s,%s,%s,%s,%s)',
            (new_id, name, base_slug, make_internal_id, external_id, now_utc(), now_utc()),
        )
        return new_id, True


def get_or_create_generation(cur, model_internal_id, auto_external_id: int, name: str, year_from, year_to, body_type):
    """Upsert VehicleGeneration by ExternalId. Returns (internal UUID, was_created)."""
    cur.execute('SELECT "Id" FROM "VehicleGenerations" WHERE "ExternalId" = %s', (auto_external_id,))
    row = cur.fetchone()
    if row:
        cur.execute(
            'UPDATE "VehicleGenerations" SET "Name"=%s, "Slug"=%s, "VehicleModelId"=%s, "YearFrom"=%s, "YearTo"=%s, "BodyType"=%s, "UpdatedAt"=%s WHERE "ExternalId"=%s RETURNING "Id"',
            (name, slugify(name), model_internal_id, year_from, year_to, body_type, now_utc(), auto_external_id),
        )
        return cur.fetchone()[0], False
    else:
        new_id = new_uuid()
        base_slug = slugify(name)
        cur.execute('SELECT 1 FROM "VehicleGenerations" WHERE "Slug"=%s', (base_slug,))
        if cur.fetchone():
            base_slug = f"{base_slug}-{str(new_id)[:8]}"
        cur.execute(
            'INSERT INTO "VehicleGenerations" ("Id","Name","Slug","VehicleModelId","YearFrom","YearTo","BodyType","ExternalId","CreatedAt","UpdatedAt") VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (new_id, name, base_slug, model_internal_id, year_from, year_to, body_type, auto_external_id, now_utc(), now_utc()),
        )
        return new_id, True


def get_or_create_engine(cur, gen_internal_id, engine_external_id: int, name: str, specs_parsed: dict):
    """Upsert VehicleEngine by ExternalId. Returns (internal UUID, was_created)."""
    cur.execute('SELECT "Id" FROM "VehicleEngines" WHERE "ExternalId" = %s', (engine_external_id,))
    row = cur.fetchone()

    displacement_str = f"{specs_parsed.get('displacement_cc')} cc" if specs_parsed.get("displacement_cc") else None

    if row:
        cur.execute(
            '''UPDATE "VehicleEngines" SET
                "Name"=%s, "VehicleGenerationId"=%s, "Displacement"=%s, "DisplacementCc"=%s,
                "FuelType"=%s, "PowerHp"=%s, "Gearbox"=%s, "Drivetrain"=%s, "UpdatedAt"=%s
               WHERE "ExternalId"=%s RETURNING "Id"''',
            (
                name, gen_internal_id, displacement_str, specs_parsed.get("displacement_cc"),
                specs_parsed.get("fuel_type"), specs_parsed.get("power_hp"),
                specs_parsed.get("gearbox"), specs_parsed.get("drivetrain"),
                now_utc(), engine_external_id,
            ),
        )
        return cur.fetchone()[0], False
    else:
        new_id = new_uuid()
        cur.execute(
            '''INSERT INTO "VehicleEngines"
               ("Id","Name","VehicleGenerationId","Displacement","DisplacementCc","FuelType",
                "PowerHp","Gearbox","Drivetrain","ExternalId","CreatedAt","UpdatedAt")
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
            (
                new_id, name, gen_internal_id, displacement_str, specs_parsed.get("displacement_cc"),
                specs_parsed.get("fuel_type"), specs_parsed.get("power_hp"),
                specs_parsed.get("gearbox"), specs_parsed.get("drivetrain"),
                engine_external_id, now_utc(), now_utc(),
            ),
        )
        return new_id, True


# ---------------------------------------------------------------------------
# Main import
# ---------------------------------------------------------------------------

def main():
    print("=== Akinel Vehicle Catalog Import ===")
    print(f"Connecting to {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']} ...")

    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False

    try:
        # Load JSON files
        print(f"Loading {BRANDS_FILE} ...")
        with open(BRANDS_FILE) as f:
            brands_data = json.load(f)

        print(f"Loading {AUTOMOBILES_FILE} ...")
        with open(AUTOMOBILES_FILE) as f:
            automobiles_data = json.load(f)

        print(f"Loading {ENGINES_FILE} ...")
        with open(ENGINES_FILE) as f:
            engines_data = json.load(f)

        print(f"Records: {len(brands_data)} brands, {len(automobiles_data)} automobiles, {len(engines_data)} engines")

        # Build lookup maps
        auto_by_id = {a["id"]: a for a in automobiles_data}
        brands_by_id = {b["id"]: b for b in brands_data}

        # -------------------------------------------------------------------
        # Step 1: Import brands → VehicleMake
        # -------------------------------------------------------------------
        print("\n--- Importing Brands → VehicleMake ---")
        cur = conn.cursor()

        make_id_map = {}  # external_brand_id → internal UUID
        brands_inserted = 0
        brands_updated = 0
        brands_errors = 0

        for brand in brands_data:
            try:
                ext_id = int(brand["id"])
                raw_name = brand.get("name", "").strip()
                if not raw_name:
                    continue
                name = normalize_brand(raw_name)
                logo_url = brand.get("logo") or None

                # Check if exists
                cur.execute('SELECT "Id" FROM "VehicleMakes" WHERE "ExternalId" = %s', (ext_id,))
                row = cur.fetchone()

                internal_id = get_or_create_make(cur, ext_id, name, logo_url)
                make_id_map[ext_id] = internal_id

                if row:
                    brands_updated += 1
                else:
                    brands_inserted += 1

            except Exception as e:
                brands_errors += 1
                print(f"  WARNING: Brand {brand.get('id')} failed: {e}")
                conn.rollback()
                cur = conn.cursor()
                continue

        conn.commit()
        print(f"  Brands: {brands_inserted} inserted, {brands_updated} updated, {brands_errors} errors")

        # -------------------------------------------------------------------
        # Step 2: Import automobiles → VehicleModel + VehicleGeneration
        # -------------------------------------------------------------------
        print("\n--- Importing Automobiles → VehicleModel + VehicleGeneration ---")

        # model_id_map: (make_internal_id, model_name_lower) → internal model UUID
        model_id_map = {}
        gen_id_map = {}  # automobile_external_id → generation internal UUID

        models_inserted = 0
        models_updated = 0
        gens_inserted = 0
        gens_updated = 0
        auto_errors = 0

        BATCH_SIZE = 200
        batch_count = 0

        cur = conn.cursor()

        for auto in automobiles_data:
            try:
                auto_ext_id = int(auto["id"])
                brand_ext_id = int(auto["brand_id"])
                raw_name = auto.get("name", "").strip()

                if brand_ext_id not in make_id_map:
                    # Brand not imported (skipped due to error), skip
                    auto_errors += 1
                    continue

                make_internal_id = make_id_map[brand_ext_id]
                brand_name = normalize_brand(brands_by_id[brand_ext_id]["name"])

                model_name, gen_name, year_from, year_to, body_style = parse_automobile_name(raw_name, brand_name)

                if not model_name:
                    auto_errors += 1
                    print(f"  WARNING: Could not parse model name from '{raw_name}'")
                    continue

                # Get or create VehicleModel
                model_key = (make_internal_id, model_name.lower())
                if model_key not in model_id_map:
                    # Use automobile external_id as placeholder; we'll use the make+name lookup
                    # For models we use a synthetic external_id: we track by (make, name) — not by external_id
                    # We find or create a model for this make+name combo
                    cur.execute(
                        'SELECT "Id", "ExternalId" FROM "VehicleModels" WHERE "VehicleMakeId"=%s AND lower("Name")=%s',
                        (make_internal_id, model_name.lower()),
                    )
                    existing_model = cur.fetchone()
                    if existing_model:
                        model_id_map[model_key] = existing_model[0]
                        models_updated += 1
                    else:
                        new_model_id = new_uuid()
                        base_slug = slugify(model_name)
                        cur.execute('SELECT 1 FROM "VehicleModels" WHERE "Slug"=%s', (base_slug,))
                        if cur.fetchone():
                            base_slug = f"{base_slug}-{str(new_model_id)[:8]}"
                        cur.execute(
                            'INSERT INTO "VehicleModels" ("Id","Name","Slug","VehicleMakeId","CreatedAt","UpdatedAt") VALUES (%s,%s,%s,%s,%s,%s)',
                            (new_model_id, model_name, base_slug, make_internal_id, now_utc(), now_utc()),
                        )
                        model_id_map[model_key] = new_model_id
                        models_inserted += 1

                model_internal_id = model_id_map[model_key]

                # Get or create VehicleGeneration (keyed by automobile external_id)
                cur.execute('SELECT "Id" FROM "VehicleGenerations" WHERE "ExternalId" = %s', (auto_ext_id,))
                existing_gen = cur.fetchone()
                if existing_gen:
                    gen_internal_id = existing_gen[0]
                    cur.execute(
                        'UPDATE "VehicleGenerations" SET "Name"=%s, "Slug"=%s, "VehicleModelId"=%s, "YearFrom"=%s, "YearTo"=%s, "BodyType"=%s, "UpdatedAt"=%s WHERE "ExternalId"=%s',
                        (gen_name, slugify(gen_name), model_internal_id, year_from, year_to, body_style, now_utc(), auto_ext_id),
                    )
                    gens_updated += 1
                else:
                    gen_internal_id = new_uuid()
                    base_slug = slugify(gen_name)
                    cur.execute('SELECT 1 FROM "VehicleGenerations" WHERE "Slug"=%s', (base_slug,))
                    if cur.fetchone():
                        base_slug = f"{base_slug}-{str(gen_internal_id)[:8]}"
                    cur.execute(
                        'INSERT INTO "VehicleGenerations" ("Id","Name","Slug","VehicleModelId","YearFrom","YearTo","BodyType","ExternalId","CreatedAt","UpdatedAt") VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
                        (gen_internal_id, gen_name, base_slug, model_internal_id, year_from, year_to, body_style, auto_ext_id, now_utc(), now_utc()),
                    )
                    gens_inserted += 1

                gen_id_map[auto_ext_id] = gen_internal_id

                batch_count += 1
                if batch_count % BATCH_SIZE == 0:
                    conn.commit()
                    print(f"  ... {batch_count} automobiles processed")

            except Exception as e:
                auto_errors += 1
                print(f"  WARNING: Automobile {auto.get('id')} failed: {e}")
                conn.rollback()
                cur = conn.cursor()
                # Restore already-committed state (model_id_map entries from previous batches are valid)
                continue

        conn.commit()
        print(f"  Models: {models_inserted} inserted, {models_updated} found/reused")
        print(f"  Generations: {gens_inserted} inserted, {gens_updated} updated")
        print(f"  Automobile errors: {auto_errors}")

        # -------------------------------------------------------------------
        # Step 3: Import engines → VehicleEngine
        # -------------------------------------------------------------------
        print("\n--- Importing Engines → VehicleEngine ---")

        engines_inserted = 0
        engines_updated = 0
        engine_errors = 0
        batch_count = 0

        cur = conn.cursor()

        for engine in engines_data:
            try:
                eng_ext_id = int(engine["id"])
                auto_ext_id = int(engine["automobile_id"])
                eng_name = engine.get("name", "").strip()

                if auto_ext_id not in gen_id_map:
                    # Automobile not imported, skip
                    engine_errors += 1
                    continue

                gen_internal_id = gen_id_map[auto_ext_id]

                # Parse specs — handle varying structure
                raw_specs = engine.get("specs", {})
                if isinstance(raw_specs, str):
                    try:
                        raw_specs = json.loads(raw_specs)
                    except Exception:
                        raw_specs = {}

                specs_parsed = parse_engine_specs(eng_name, raw_specs)

                displacement_str = f"{specs_parsed.get('displacement_cc')} cc" if specs_parsed.get("displacement_cc") else None

                # Upsert engine
                cur.execute('SELECT "Id" FROM "VehicleEngines" WHERE "ExternalId" = %s', (eng_ext_id,))
                existing = cur.fetchone()

                if existing:
                    cur.execute(
                        '''UPDATE "VehicleEngines" SET
                            "Name"=%s, "VehicleGenerationId"=%s, "Displacement"=%s, "DisplacementCc"=%s,
                            "FuelType"=%s, "PowerHp"=%s, "Gearbox"=%s, "Drivetrain"=%s, "UpdatedAt"=%s
                           WHERE "ExternalId"=%s''',
                        (
                            eng_name, gen_internal_id, displacement_str, specs_parsed.get("displacement_cc"),
                            specs_parsed.get("fuel_type"), specs_parsed.get("power_hp"),
                            specs_parsed.get("gearbox"), specs_parsed.get("drivetrain"),
                            now_utc(), eng_ext_id,
                        ),
                    )
                    engines_updated += 1
                else:
                    new_id = new_uuid()
                    cur.execute(
                        '''INSERT INTO "VehicleEngines"
                           ("Id","Name","VehicleGenerationId","Displacement","DisplacementCc","FuelType",
                            "PowerHp","Gearbox","Drivetrain","ExternalId","CreatedAt","UpdatedAt")
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
                        (
                            new_id, eng_name, gen_internal_id, displacement_str,
                            specs_parsed.get("displacement_cc"), specs_parsed.get("fuel_type"),
                            specs_parsed.get("power_hp"), specs_parsed.get("gearbox"),
                            specs_parsed.get("drivetrain"), eng_ext_id, now_utc(), now_utc(),
                        ),
                    )
                    engines_inserted += 1

                batch_count += 1
                if batch_count % 1000 == 0:
                    conn.commit()
                    print(f"  ... {batch_count} engines processed")

            except Exception as e:
                engine_errors += 1
                if engine_errors <= 10:
                    print(f"  WARNING: Engine {engine.get('id')} failed: {e}")
                conn.rollback()
                cur = conn.cursor()
                continue

        conn.commit()
        print(f"  Engines: {engines_inserted} inserted, {engines_updated} updated")
        print(f"  Engine errors: {engine_errors}")

        # -------------------------------------------------------------------
        # Summary
        # -------------------------------------------------------------------
        print("\n=== Import complete ===")

        cur.execute('SELECT COUNT(*) FROM "VehicleMakes"')
        total_makes = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM "VehicleModels"')
        total_models = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM "VehicleGenerations"')
        total_gens = cur.fetchone()[0]
        cur.execute('SELECT COUNT(*) FROM "VehicleEngines"')
        total_engines = cur.fetchone()[0]

        print(f"  DB totals — Makes: {total_makes}, Models: {total_models}, Generations: {total_gens}, Engines: {total_engines}")

    except Exception as e:
        conn.rollback()
        print(f"\nFATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
