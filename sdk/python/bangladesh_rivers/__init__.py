"""
Bangladesh Rivers Geo-Vault Python SDK
Author: Mohammad Golamrabbii (মোহাম্মদ গোলাম রাব্বী)
Website: https://github.com/mohammadgolamrabbii/Bangladesh-Rivers-Geo-Vault
"""

from .core import (
    get_all_rivers,
    get_river_by_id,
    search_rivers,
    get_transboundary_rivers,
    get_rivers_by_basin,
    get_bcs_questions,
    get_summary,
)

__version__ = "1.0.0"
__author__ = "Mohammad Golamrabbii"
__all__ = [
    "get_all_rivers",
    "get_river_by_id",
    "search_rivers",
    "get_transboundary_rivers",
    "get_rivers_by_basin",
    "get_bcs_questions",
    "get_summary",
]
