"""
Arogya Link — OfflineSyncEngine (stub)
========================================
Phase: 13 — Offline-First Kiosk

Responsibility
--------------
Processes batches of answers captured offline (stored in the kiosk's
IndexedDB) and synchronizes them to the server database in an idempotent
manner so that duplicate sync requests never corrupt the encounter record.

Safety constraints (non-negotiable, from Rules.md)
---------------------------------------------------
* Offline synchronization must be IDEMPOTENT — replaying the same batch
  must produce the same final state as applying it once.
* The server is AUTHORITATIVE after synchronization; the client must not
  win merge conflicts by default.
* Every synced answer must still be linked to a valid, consented encounter.

Implementation target: Phase 13
"""

from __future__ import annotations

from typing import Any

__all__ = ["OfflineSyncEngine"]


class OfflineSyncEngine:
    """Handles idempotent synchronization of offline-captured answers.

    All public methods raise :class:`NotImplementedError` until Phase 13.
    """

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 13
    # ------------------------------------------------------------------

    def merge_answers(
        self,
        encounter_id: str,
        offline_batch: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Merge *offline_batch* answers into the encounter record.

        Each item in *offline_batch* must contain: ``question_id``,
        ``value``, ``captured_at`` (ISO-8601 timestamp).

        Returns a merge result with ``accepted``, ``skipped``, and
        ``conflict`` lists.

        :raises NotImplementedError: until Phase 13 is implemented.
        """
        raise NotImplementedError("OfflineSyncEngine.merge_answers — implement in Phase 13")

    def validate_batch(self, offline_batch: list[dict[str, Any]]) -> list[str]:
        """Validate *offline_batch* structure before attempting merge.

        Returns a list of validation error messages.  An empty list means
        the batch is structurally valid (encounter existence is checked
        separately at the API layer).

        :raises NotImplementedError: until Phase 13 is implemented.
        """
        raise NotImplementedError("OfflineSyncEngine.validate_batch — implement in Phase 13")
