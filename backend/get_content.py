from google import genai
from pydantic import BaseModel
import os
import logging
from create_logger import setup_logger
from google.genai import errors
import asyncio
from get_secret import fetch_secret

logger = setup_logger(__name__)

API_KEY = fetch_secret('gemini_api_key', 'GOOGLE_API_KEY')
client = genai.Client(api_key=API_KEY)

class VitaminContent(BaseModel):
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


async def get_vitamin_content(description: str | None, serving: int | None):
    
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"What is the nutritional content of {serving} grams of {description} in terms of the following vitamins: Vitamin A, Vitamin B1, Vitamin B3, Vitamin B5, Vitamin B6, Vitamin B7, Vitamin B9, Vitamin B12, Vitamin C, Vitamin D, Vitamin E, and Vitamin K.",
            config={
                "response_mime_type": "application/json",
                "response_schema": VitaminContent,
            },
        )

        return response.parsed.model_dump()
    
    
    except errors.APIError as e:
        logger.warning(f"Status code {e.code}, message: {e.message}", exc_info=True)
        return None
    except Exception as e:
        logger.warning(f"Unexpected error {e}", exc_info=True)
        return None
class MineralContent(BaseModel):
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

async def get_mineral_content(description: str | None, serving: int | None):
    
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"What is the nutritional content of {serving} grams of {description} in terms of the following minerals: calcium, copper, chromium, iron, iodine, magnesium, manganese, molybdenum, potassium, phosphorus, selenium, sodium, and zinc.",
            config={
                "response_mime_type": "application/json",
                "response_schema": MineralContent,
            },
        )

        return response.parsed.model_dump()
    
    except errors.APIError as e:
        logger.warning(f"Status code {e.code}, message: {e.message}", exc_info=True)
        return None
    except Exception as e:
        logger.warning(f"Unexpected error {e}", exc_info=True)
        return None
    
async def get_combined_content(description: str | None, serving: int | None):
    vitamins_task = get_vitamin_content(description, serving)
    minerals_task = get_mineral_content(description, serving)

    vitamins, minerals = await asyncio.gather(vitamins_task, minerals_task)

    combined_content = {}

    if vitamins:
        combined_content.update(vitamins)
    if minerals:
        combined_content.update(minerals)

    if not vitamins or not minerals:
        logger.error(f"Failed to retrieve the nutritional content of {serving} grams of {description}")
        return blank_nutrients

    return combined_content

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

