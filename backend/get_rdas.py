from google import genai
from pydantic import BaseModel
import os
import logging
from google.genai import errors
import asyncio
from create_logger import setup_logger
from get_secret import fetch_secret

logger = setup_logger(__name__)

API_KEY = fetch_secret('gemini_api_key', 'GOOGLE_API_KEY')

client = genai.Client(api_key=API_KEY)

class VitaminRDAs(BaseModel):
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


async def get_vitamin_RDAs(Age: int, Gender: str):
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"What are the RDAs for a {Age} year old {Gender} for the following vitamins: Vitamin A, Vitamin B1, Vitamin B3, Vitamin B5, Vitamin B6, Vitamin B7, Vitamin B9, Vitamin B12, Vitamin C, Vitamin D, Vitamin E, and Vitamin K.",
            config={
                "response_mime_type": "application/json",
                "response_schema": VitaminRDAs,
            },
        )
        return response.parsed.model_dump()
    
    except errors.APIError as e:
        logger.warning(f"Status code {e.code}, message: {e.message}", exc_info=True)
        return None
    except Exception as e:
        logger.warning(f"Unexpected error {e}", exc_info=True)
        return None

class MineralRDAs(BaseModel):
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

async def get_mineral_RDAs(Age: int, Gender: str):
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"What are the RDAs for a {Age} year old {Gender} for the following minerals: calcium, copper, chromium, iron, iodine, magnesium, manganese, molybdenum, potassium, phosphorus, selenium, sodium, and zinc.",
            config={
                "response_mime_type": "application/json",
                "response_schema": MineralRDAs,
            },
        )

        return response.parsed.model_dump()
    
    except errors.APIError as e:
        logger.warning(f"Status code {e.code}, message: {e.message}", exc_info=True)
        return None
    except Exception as e:
        logger.warning(f"Unexpected error {e}", exc_info=True)
        return None
    
rda_cache = {}

async def get_combined_RDAs(Age: int, Gender: str):
    cache_key = f"{Age}-{Gender}"
    if cache_key in rda_cache:
        return rda_cache[cache_key]
    vitamin_task = get_vitamin_RDAs(Age, Gender)
    mineral_task = get_mineral_RDAs(Age, Gender)

    vitamin_response, mineral_response = await asyncio.gather(vitamin_task, mineral_task)

    combined_RDAs = {}

    if vitamin_response:
        combined_RDAs.update(vitamin_response)

    if mineral_response:
        combined_RDAs.update(mineral_response)

    if not mineral_response or not vitamin_response:
        logger.error(f"Failed to retrieve complete RDA data for a {Age} year old {Gender}. Returning blank dict")
        return {}
    
    rda_cache[cache_key] = combined_RDAs

    return combined_RDAs











