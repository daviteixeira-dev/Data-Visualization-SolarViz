import os
import json
from datetime import datetime, timezone, timedelta
from astroquery.jplhorizons import Horizons

OUTPUT_PATH = "data/planets_static.json"

# ----------------------
# PLANETAS
# ----------------------
PLANETS = {
    "Mercúrio": {"id": 199, "radius": 2440},
    "Vênus": {"id": 299, "radius": 6052},
    "Terra": {"id": 399, "radius": 6371},
    "Marte": {"id": 499, "radius": 3390},
    "Júpiter": {"id": 599, "radius": 69911},
    "Saturno": {"id": 699, "radius": 58232},
    "Urano": {"id": 799, "radius": 25362},
    "Netuno": {"id": 899, "radius": 24622},
}

# ----------------------------
# LUAS (Alinhadas com live.js)
# ----------------------------

MOONS = {
    "Lua": {
        "id": 301,
        "planet": "Terra",
        "planet_id": 399,
        "radius": 1737
    },
    "Io": {
        "id": 501,
        "planet": "Júpiter",
        "planet_id": 599,
        "radius": 1821
    },
    "Europa": {
        "id": 502,
        "planet": "Júpiter",
        "planet_id": 599,
        "radius": 1560
    },
    "Ganymede": {
        "id": 503,
        "planet": "Júpiter",
        "planet_id": 599,
        "radius": 2634
    },
    "Callisto": {
        "id": 504,
        "planet": "Júpiter",
        "planet_id": 599,
        "radius": 2410
    },
    "Titan": {
        "id": 606,
        "planet": "Saturno",
        "planet_id": 699,
        "radius": 2575
    }
}

# ----------------------
# HELPERS
# ----------------------

def fetch_orbital_elements(body_id, center=10):
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    try:
        obj = Horizons(
            id=body_id,
            location=f"500@{center}",
            epochs=today
        )
        el = obj.elements()[0]
    except Exception:
        obj = Horizons(
            id=body_id,
            location=f"500@{center}",
            epochs={
                "start": today,
                "stop": (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d"),
                "step": "1d"
            }
        )
        el = obj.elements()[0]

    a_AU = float(el["a"])
    period_days = float(el["P"])

    return {
        "orbit_km": a_AU * 149597870.7,  # AU → km
        "period_days": period_days,
        "eccentricity": float(el["e"]),
        "perihelion_arg_deg": float(el["w"]),
        "a_AU": a_AU,
        "i_deg": float(el["incl"]),
        "raan_deg": float(el["Omega"]),
        "argp_deg": float(el["w"]),
        "M_deg": float(el["M"])
    }

# ----------------------
# MAIN
# ----------------------

def main():
    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "JPL Horizons",
        "planets": {},
        "moons": {}
    }

    # Planets (heliocentric)
    for name, info in PLANETS.items():
        print(f"Fetching planet: {name}")
        orbit = fetch_orbital_elements(info["id"], center=10)  # Sun
        data["planets"][name] = {
            "id": info["id"],
            "radius": info["radius"],
            **orbit
        }

    # Moons (planet-centric)
    for name, info in MOONS.items():
        print(f"Fetching moon: {name}")
        orbit = fetch_orbital_elements(
            body_id=info["id"],
            center=info["planet_id"]
        )
        data["moons"][name] = {
            "id": info["id"],
            "planet": info["planet"],
            "radius": info["radius"],
            "eccentricity": orbit["eccentricity"],
            "orbit_km": orbit["orbit_km"],
            "period_days": orbit["period_days"]
        }

    os.makedirs("data", exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("✅ Static planetary + moon data generated successfully.")

if __name__ == "__main__":
    main()
