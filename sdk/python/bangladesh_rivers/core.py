import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "json"

def _load_json(filename: str) -> Any:
    file_path = DATA_DIR / filename
    if not file_path.exists():
        fallback = Path(__file__).resolve().parent / "data" / filename
        if fallback.exists():
            file_path = fallback
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_all_rivers() -> List[Dict[str, Any]]:
    """Return all 725+ documented rivers."""
    return _load_json("rivers.json")

def get_river_by_id(river_id: str) -> Optional[Dict[str, Any]]:
    """Find a river by its unique code, e.g. 'BD-RIV-001'."""
    rivers = get_all_rivers()
    for r in rivers:
        if r.get("id", "").lower() == river_id.lower():
            return r
    return None

def search_rivers(query: str) -> List[Dict[str, Any]]:
    """Search rivers across Bengali name, English name, origin, outfall, basin, or districts."""
    if not query:
        return get_all_rivers()
    q = query.strip().lower()
    rivers = get_all_rivers()
    results = []
    for r in rivers:
        name_bn = r.get("name_bn", "").lower()
        name_en = r.get("name_en", "").lower()
        origin_bn = r.get("origin_bn", "").lower()
        origin_en = r.get("origin_en", "").lower()
        outfall_bn = r.get("outfall_bn", "").lower()
        outfall_en = r.get("outfall_en", "").lower()
        basin = r.get("basin", "").lower()
        districts = [d.lower() for d in r.get("districts", [])]
        
        if (
            q in name_bn
            or q in name_en
            or q in origin_bn
            or q in origin_en
            or q in outfall_bn
            or q in outfall_en
            or q in basin
            or any(q in d for d in districts)
        ):
            results.append(r)
    return results

def get_transboundary_rivers() -> List[Dict[str, Any]]:
    """Return the official 57 transboundary rivers with India and Myanmar."""
    rivers = get_all_rivers()
    return [r for r in rivers if r.get("transboundary") is True or r.get("is_transboundary") is True]

def get_rivers_by_basin(basin_name: str) -> List[Dict[str, Any]]:
    """Filter rivers by basin name."""
    q = basin_name.strip().lower()
    rivers = get_all_rivers()
    return [r for r in rivers if q in r.get("basin", "").lower()]

def get_bcs_questions() -> List[Dict[str, Any]]:
    """Return high-yield BCS exam questions & answers on Bangladesh rivers."""
    return _load_json("bcs_qa.json")

def get_summary() -> Dict[str, Any]:
    """Return high-level summary statistics of the dataset."""
    return _load_json("summary.json")
