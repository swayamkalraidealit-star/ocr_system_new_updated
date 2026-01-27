import os
import json
import math
from google import genai
from PIL import Image
from pathlib import Path

# --- PART 1: THE DETERMINISTIC ENGINE (Your Verified Logic) ---
class DrawnSteelCalculator:
    def __init__(self):
        # Constants from your engineering analysis
        self.DENSITY_G_CM3 = 7.85 
        # The critical "Real Logic" variable derived from your PDF notes
        self.EFFECTIVE_THICKNESS_MM = 1.50 

    def calculate_weight(self, surface_area_mm2):
        volume_mm3 = surface_area_mm2 * self.EFFECTIVE_THICKNESS_MM
        volume_cm3 = volume_mm3 / 1000.0
        weight_grams = volume_cm3 * self.DENSITY_G_CM3
        return round(weight_grams / 1000.0, 3)

    def calculate_from_dimensions(self, dims):
        """
        Takes a dictionary of dimensions and routes to the correct math logic.
        """
        shape_type = dims.get('shape_type', 'rectangular')
        
        # 1. Gross Area (Outer Flange)
        gross_area = dims['outer_width'] * dims['outer_height']
        
        # 2. Subtract Cutout (Center Hole)
        if shape_type == 'round':
            # Handle None safely
            c_dia = dims.get('cutout_diameter')
            if c_dia is None:
                c_dia = 0.0
            radius = c_dia / 2.0
            cutout_area = math.pi * (radius ** 2)
        else:
            # Rectangular default
            # Handle possible keys for draw_width/height being None
            dw = dims.get('draw_width') or 0.0
            dh = dims.get('draw_height') or 0.0
            cutout_area = dw * dh
            
        # 3. Add Drawn Walls (Vertical Surface)
        if shape_type == 'round':
            # Circumference * Depth
            wall_area = (math.pi * dims['draw_diameter']) * dims['draw_depth']
        else:
            # Perimeter * Depth
            dw = dims.get('draw_width') or 0.0
            dh = dims.get('draw_height') or 0.0
            perimeter = 2 * (dw + dh)
            wall_area = perimeter * dims['draw_depth']
            
        # 4. Overhead deduction for slots/corners (averaged)
        overhead = 350.0 
        
        net_area = gross_area - cutout_area + wall_area - overhead
        return self.calculate_weight(net_area)

# --- PART 2: THE AI EXTRACTION (Gemini Vision) ---
def extract_dimensions_with_gemini(image_path, api_key):
    """
    Uses Gemini 1.5 Flash (fast & cheap) or Pro to read the drawing.
    """
    # print(f"DEBUG: Initializing Client with key: ...") # Removed for security/cleanliness

    
    # Ensure key is clean
    if api_key:
        api_key = api_key.strip()

    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Error initializing client: {e}")
        return {}
    
    try:
        image = Image.open(image_path)
    except Exception as e:
        print(f"Error opening image {image_path}: {e}")
        return {}

    # The Prompt: Strictly instructs the AI to be a data extractor
    prompt = """
    Analyze this engineering drawing for a Drawn Steel Box.
    I need to calculate the weight, so I need specific bounding box dimensions.
    
    Extract the following and return ONLY a JSON object:
    1. "shape_type": either "rectangular" or "round".
    2. "outer_width": The largest outer dimension (width).
    3. "outer_height": The largest outer dimension (height).
    4. "draw_depth": The depth of the box (side view). Often 19.05mm, but looks for other values (e.g. 25mm, 50mm, 90mm+).
    5. "draw_width": The width of the inner drawn box (for rectangular).
    6. "draw_height": The height of the inner drawn box (for rectangular).
    7. "draw_diameter": The diameter of the draw (for round parts).
    8. "cutout_diameter": The large central hole diameter (for round parts).
    
    If a value is not applicable (like draw_diameter for a square box), use null.
    Convert all values to floats. Do not perform any calculations.
    """

    # List of models to try in order of preference/likelihood to work
    models_to_try = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite-preview-02-05',
        'gemini-2.5-flash',
        'gemini-flash-latest'
    ]

    for model_name in models_to_try:
        print(f"DEBUG: Trying model: {model_name}...")
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=[prompt, image]
            )
            
            # If successful, parse and return
            if response.text:
                clean_text = response.text.replace('```json', '').replace('```', '').strip()
                return json.loads(clean_text)
            else:
                print(f"Warning: Model {model_name} returned empty text. Trying next...")
                
        except Exception as e:
            error_str = str(e)
            if "429" in error_str:
                print(f"  -> Quota limit (429) for {model_name}. Trying next...")
            elif "404" in error_str:
                print(f"  -> Model not found (404): {model_name}. Trying next...")
            else:
                print(f"  -> Error with {model_name}: {e}")
                
    print("Error: All models failed or quota exceeded.")
    return {}

# --- PART 3: THE MAIN CONTROLLER (Hybrid Workflow) ---
def process_drawing_pipeline(input_path, api_key):
    print(f"1. AI Processing: Analyzing {input_path}...")
    
    # Check for PDF
    image_paths_to_process = []
    temp_images = []
    
    if input_path.lower().endswith('.pdf'):
        try:
            from pdf2image import convert_from_path
            print("   -> Detecting PDF. Converting to image...")
            images = convert_from_path(input_path)
            if not images:
                print("Error: efficient PDF conversion failed.")
                return None, None
            
            # Save first page as temp image
            temp_img_path = input_path.replace('.pdf', '_temp.jpg')
            images[0].save(temp_img_path, 'JPEG')
            image_paths_to_process.append(temp_img_path)
            temp_images.append(temp_img_path)
        except ImportError:
            print("Error: pdf2image not installed. Cannot process PDF.")
            return None, None
        except Exception as e:
            print(f"Error converting PDF: {e}")
            return None, None
    else:
        image_paths_to_process.append(input_path)
    
    # Process the first valid image (assuming single page drawing for now)
    final_weight = None
    
    for img_path in image_paths_to_process:
        # Step A: Gemini "Sees" the drawing
        extracted_data = extract_dimensions_with_gemini(img_path, api_key)
        print(f"   -> Extracted Data: {json.dumps(extracted_data, indent=2)}")
        
        # Step B: Python "Calculates" the weight
        if not extracted_data:
            print("Error: No data extracted from Gemini. Cannot proceed with calculation.")
            continue
            
        engine = DrawnSteelCalculator()
        final_weight = engine.calculate_from_dimensions(extracted_data)
        
        print(f"2. Deterministic Engine: Calculating with 1.50mm thinning logic...")
        print(f"\n✅ FINAL ESTIMATED WEIGHT: {final_weight} kg")
        
        # Break after successful processing
        if final_weight is not None:
             break

    # Cleanup temp images
    for tmp in temp_images:
        if os.path.exists(tmp):
            os.remove(tmp)
            
    return final_weight, extracted_data

# --- RUN EXAMPLE ---
if __name__ == "__main__":
    # 1. API Key Strategy: Env Var -> Hardcoded -> Prompt
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        # User can set their key here directly if not using env vars
        api_key = "AIzaSyAFn5nf10mjDzC6G-IKuKrNEGlpIcjg6iA"

    # 2. Image Selection
    # Try found image if default doesn't exist
    candidates = ["AMR1224TG_OUTER.png"]
    image_file = None
    for cand in candidates:
        if os.path.exists(cand):
            image_file = cand
            break
            
    if not image_file:
        print(f"Error: Could not find any of the candidate images: {candidates}")
        print("Please place an image file in this directory.")
    elif api_key == "YOUR_GOOGLE_API_KEY":
        print("Please set your API Key in the script or via GOOGLE_API_KEY environment variable.")
        print(f"Found image: {image_file}")
    else:
        process_drawing_pipeline(image_file, api_key)
