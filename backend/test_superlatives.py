import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

# from search_engine import search_features
from deepseek_provider import DeepSeekProvider

async def test_superlatives():
    print("🔍 Testing superlative search logic...")
    
    # Mock the DeepSeek response to avoid actual API calls and test the sorting logic purely
    # We will manually inject a mock result into the provider's _match_to_gazetteer to test sorting
    
    provider = DeepSeekProvider()
    
    # Mock features
    mock_features = [
        {"name": "Big Crater", "body": "moon", "category": "Crater", "diameter_km": 500, "keywords": ["crater"]},
        {"name": "Medium Crater", "body": "moon", "category": "Crater", "diameter_km": 100, "keywords": ["crater"]},
        {"name": "Small Crater", "body": "moon", "category": "Crater", "diameter_km": 10, "keywords": ["crater"]},
        {"name": "Tiny Crater", "body": "moon", "category": "Crater", "diameter_km": 1, "keywords": ["crater"]},
    ]
    
    # Test 1: Ascending sort (Smallest)
    print("\nTest 1: 'smallest crater' (Ascending Sort)")
    mock_response_asc = {
        "body": "moon",
        "feature_type": "crater",
        "sort": "asc",
        "confidence": 0.9
    }
    
    result_asc = provider._match_to_gazetteer(mock_response_asc, mock_features)
    if result_asc and result_asc.feature_name == "Tiny Crater":
        print("  ✅ PASS: Found 'Tiny Crater' (1km)")
    else:
        print(f"  ❌ FAIL: Found '{result_asc.feature_name if result_asc else 'None'}'")

    # Test 2: Descending sort (Largest)
    print("\nTest 2: 'largest crater' (Descending Sort)")
    mock_response_desc = {
        "body": "moon",
        "feature_type": "crater",
        "sort": "desc",
        "confidence": 0.9
    }
    
    result_desc = provider._match_to_gazetteer(mock_response_desc, mock_features)
    if result_desc and result_desc.feature_name == "Big Crater":
        print("  ✅ PASS: Found 'Big Crater' (500km)")
    else:
        print(f"  ❌ FAIL: Found '{result_desc.feature_name if result_desc else 'None'}'")

    # Test 3: Null sort (Default)
    print("\nTest 3: 'crater' (Default Sort - likely by score/name match)")
    mock_response_default = {
        "body": "moon",
        "feature_type": "crater",
        "sort": None,
        "confidence": 0.5
    }
    # For default, score depends on body match (40) + type match (30). All match equally.
    # It might pick the first one or arbitrary stable sort.
    result_default = provider._match_to_gazetteer(mock_response_default, mock_features)
    if result_default:
        print(f"  ✅ PASS: Found '{result_default.feature_name}' (Default behavior)")
    else:
        print("  ❌ FAIL: Found None")

if __name__ == "__main__":
    asyncio.run(test_superlatives())
