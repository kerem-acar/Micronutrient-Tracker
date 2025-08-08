from google import genai
from pydantic import BaseModel
from create_logger import setup_logger
from google.genai import errors
from get_secret import fetch_secret

logger = setup_logger(__name__)

API_KEY = fetch_secret('gemini_api_key', 'GOOGLE_API_KEY')
client = genai.Client(api_key=API_KEY)

class NutritionalContent(BaseModel):
    vitamin_a: float
    vitamin_b1: float
    vitamin_b3: float
    vitamin_b5: float
    vitamin_b6: float
    vitamin_b7: float
    vitamin_b9: float
    vitamin_b12: float
    vitamin_c: float
    vitamin_d: float
    vitamin_e: float
    vitamin_k: float
    calcium: float
    copper: float
    chromium: float
    iron: float
    iodine: float
    magnesium: float
    manganese: float
    molybdenum: float
    potassium: float
    phosphorus: float
    selenium: float
    sodium: float
    zinc: float

async def get_nutritional_content(description: str | None, serving: int | None, unit: str | None):
    
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"What is the nutritional content of {serving} {unit} of {description} in terms of the following vitamins and minerals: Vitamin A, Vitamin B1, Vitamin B3, Vitamin B5, Vitamin B6, Vitamin B7, Vitamin B9, Vitamin B12, Vitamin C, Vitamin D, Vitamin E, Vitamin K, calcium, copper, chromium, iron, iodine, magnesium, manganese, molybdenum, potassium, phosphorus, selenium, sodium, and zinc.",
            config={
                "response_mime_type": "application/json",
                "response_schema": NutritionalContent,
            },
        )

        return response.parsed.model_dump()
    
    
    except errors.APIError as e:
        logger.warning(f"Status code {e.code}, message: {e.message}", exc_info=True)
        return blank_nutrients
    except Exception as e:
        logger.warning(f"Unexpected error {e}", exc_info=True)
        return blank_nutrients

blank_nutrients = {
    "vitamin_a": 0.0,
      "vitamin_b1": 0.0,
      "vitamin_b3": 0.0,
      "vitamin_b5": 0.0,
      "vitamin_b6": 0.0,
      "vitamin_b7": 0.0,
      "vitamin_b9": 0.0,
      "vitamin_b12": 0.0,
      "vitamin_c": 0.0,
      "vitamin_d": 0.0,
      "vitamin_e": 0.0,
      "vitamin_k": 0.0,
      "calcium": 0.0,
      "copper": 0.0,
      "chromium": 0.0,
      "iron": 0.0,
      "iodine": 0.0,
      "magnesium": 0.0,
      "manganese": 0.0,
      "molybdenum": 0.0,
      "potassium": 0.0,
      "phosphorus": 0.0,
      "selenium": 0.0,
      "sodium": 0.0,
      "zinc": 0.0
}

