import os
import sys

# Ensure the project root is in sys.path
sys.path.append(os.getcwd())

try:
    from backend.core import analysis
    print("Successfully imported backend.core.analysis")
    print(f"Available items: {[item for item in dir(analysis) if not item.startswith('__')]}")
    if hasattr(analysis, 'process_drawing_pipeline'):
        print("✅ process_drawing_pipeline is available.")
    else:
        print("❌ ERROR: process_drawing_pipeline NOT found in analysis.py")
except Exception as e:
    print(f"❌ ERROR: Could not import backend.core.analysis: {e}")
    import traceback
    traceback.print_exc()

