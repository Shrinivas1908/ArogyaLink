"""
Arogya Link — services/ayush_interaction_service.py
===================================================
Cross-System Pharmacological Interaction Engine (AYUSH Herbs + Allopathic Drugs).
Analyzes potential drug-herb interactions, bleeding risks, glycemic crashes, and contraindications.
"""

from __future__ import annotations

from typing import Any


class AYUSHInteractionService:
    """Detects cross-system clinical drug-herb interactions for Indian clinical practice."""

    # Interaction Knowledge Base
    INTERACTION_RULES = [
        {
            "id": "INT-001",
            "allopathic_triggers": ["aspirin", "ecosprin", "clopidogrel", "warfarin", "heparin", "apixaban", "dabigatran"],
            "ayush_triggers": ["guggulu", "lasuna", "garlic", "ginger", "shunthi", "haridra", "turmeric", "curcumin", "ginkgo"],
            "severity": "CRITICAL",
            "title": "Severe Bleeding & Platelet Aggregation Risk",
            "mechanism": "Both allopathic antiplatelets and AYUSH formulations exert synergistic anticoagulant effects.",
            "recommendation": "Monitor bleeding time, stool color, and consider withholding concentrated AYUSH extracts during active antiplatelet therapy.",
        },
        {
            "id": "INT-002",
            "allopathic_triggers": ["metformin", "glimepiride", "gliclazide", "vildagliptin", "sitagliptin", "insulin", "empagliflozin"],
            "ayush_triggers": ["karela", "momordica", "gurmar", "gymnema", "vijaysar", "methi", "fenugreek", "jamun", "madhumehari"],
            "severity": "WARNING",
            "title": "Uncontrolled Hypoglycemia Risk",
            "mechanism": "Ayurvedic antidiabetic herbs stimulate pancreatic beta cells and increase peripheral glucose uptake alongside synthetic antidiabetics.",
            "recommendation": "Advise frequent blood glucose monitoring (SMBG). Adjust synthetic antidiabetic dosages to avoid sudden hypoglycemic episodes.",
        },
        {
            "id": "INT-003",
            "allopathic_triggers": ["amlodipine", "telmisartan", "losartan", "enalapril", "ramipril", "atenolol", "furosemide"],
            "ayush_triggers": ["yashtimadhu", "licorice", "mulethi", "glycyrrhiza"],
            "severity": "WARNING",
            "title": "Antihypertensive Resistance & Pseudoaldosteronism",
            "mechanism": "Glycyrrhizin in Mulethi inhibits 11-beta-HSD2, causing mineralocorticoid excess, sodium retention, and BP spikes.",
            "recommendation": "Avoid long-term Mulethi/Yashtimadhu in hypertensive patients on ARBs, ACE inhibitors, or diuretics.",
        },
        {
            "id": "INT-004",
            "allopathic_triggers": ["alprazolam", "clonazepam", "diazepam", "zolpidem", "lorazepam", "amitriptyline"],
            "ayush_triggers": ["brahmi", "bacopa", "shankhpushpi", "jatamansi", "ashwagandha", "tagar", "valerian"],
            "severity": "CAUTION",
            "title": "Potentiated CNS Sedation & Psychomotor Impairment",
            "mechanism": "GABA-ergic herbal nootropics potentiate synthetic sedative-hypnotics.",
            "recommendation": "Warn patient against operating machinery or driving. Dose reduction of synthetic sedatives may be considered.",
        },
        {
            "id": "INT-005",
            "allopathic_triggers": ["levothyroxine", "thyronorm", "eltroxin"],
            "ayush_triggers": ["ashwagandha", "withania", "kanchnar"],
            "severity": "CAUTION",
            "title": "Altered Thyroid Hormone Levels",
            "mechanism": "Ashwagandha stimulates endogenous T3/T4 synthesis and may lead to iatrogenic hyperthyroidism when combined with Levothyroxine.",
            "recommendation": "Re-check Serum TSH and Free T4 after 4 weeks of co-administration.",
        },
    ]

    def check_interactions(
        self,
        allopathic_drugs: list[str],
        ayush_drugs: list[str],
    ) -> list[dict[str, Any]]:
        """Identify potential clinical interactions between allopathic and AYUSH regimens."""
        detected = []
        clean_allo = [d.lower().strip() for d in allopathic_drugs if d]
        clean_ayush = [d.lower().strip() for d in ayush_drugs if d]

        for rule in self.INTERACTION_RULES:
            # Check allopathic match
            matched_allo = [
                a for a in clean_allo
                if any(trigger in a for trigger in rule["allopathic_triggers"])
            ]
            # Check AYUSH match
            matched_ayush = [
                y for y in clean_ayush
                if any(trigger in y for trigger in rule["ayush_triggers"])
            ]

            if matched_allo and matched_ayush:
                detected.append({
                    "rule_id": rule["id"],
                    "severity": rule["severity"],
                    "title": rule["title"],
                    "allopathic_drug": matched_allo[0],
                    "ayush_herb": matched_ayush[0],
                    "mechanism": rule["mechanism"],
                    "clinical_recommendation": rule["recommendation"],
                })

        return detected


ayush_interaction_service = AYUSHInteractionService()
