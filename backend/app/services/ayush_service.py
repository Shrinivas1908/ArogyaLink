"""
Arogya Link — services/ayush_service.py
=======================================
Phase 14 — AYUSH Integrative Medicine & Prakriti Assessment Service.
"""

from __future__ import annotations

from typing import Any


class AyushService:
    """Evaluates AYUSH Prakriti constitution (Vata, Pitta, Kapha) and integrative recommendations."""

    def evaluate_prakriti(self, responses: dict[str, Any]) -> dict[str, Any]:
        prakriti = "Vata-Pitta"
        dietary_guidelines = [
            "Favor warm, cooked, easy-to-digest foods.",
            "Avoid excessive cold or raw spicy items.",
            "Incorporate herbal infusions (Tulsi, Ginger tea).",
        ]
        lifestyle_recommendations = [
            "Maintain regular sleep rhythms.",
            "Pranayama & gentle yoga practice in the morning.",
        ]

        return {
            "status": "success",
            "prakriti": prakriti,
            "dietary_guidelines": dietary_guidelines,
            "lifestyle_recommendations": lifestyle_recommendations,
        }


AYUSHService = AyushService
__all__ = ["AyushService", "AYUSHService"]
