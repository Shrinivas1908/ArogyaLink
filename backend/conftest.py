# Arogya Link — backend/conftest.py
# Adds the backend root to sys.path so pytest can resolve `app.*` imports
# without installing the package.
import sys
import pathlib

sys.path.insert(0, str(pathlib.Path(__file__).parent))
