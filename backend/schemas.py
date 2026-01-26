from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class TileMatrixSummary(BaseModel):
    identifier: str
    scale_denominator: Optional[float] = None
    matrix_width: int
    matrix_height: int
    tile_width: int
    tile_height: int


class TileMatrixSetSummary(BaseModel):
    identifier: str
    supported_crs: Optional[str] = None
    matrices: List[TileMatrixSummary]

    @property
    def max_zoom(self) -> int:
        return len(self.matrices) - 1


class TimeDimension(BaseModel):
    default: Optional[str] = None
    values: List[str] = Field(default_factory=list)


class BoundingBox(BaseModel):
    lower_corner: List[float] = Field(min_length=2, max_length=2)
    upper_corner: List[float] = Field(min_length=2, max_length=2)


class LayerSummary(BaseModel):
    identifier: str
    title: Optional[str] = None
    abstract: Optional[str] = None
    formats: List[str]
    tile_matrix_sets: List[str]
    time: Optional[TimeDimension] = None
    bounding_box: Optional[BoundingBox] = None


class LayerConfig(BaseModel):
    layer: LayerSummary
    tile_matrix_set: TileMatrixSetSummary
    time: Optional[str] = None
    format: str
    tile_url_template: str
    min_zoom: int
    max_zoom: int
    tile_size: int
    projection: Optional[str] = None
    attribution: Optional[str] = None
    body: Optional[str] = None


class DatasetListItem(BaseModel):
    id: str
    title: str
    body: Optional[str] = None


class ViewerConfig(BaseModel):
    id: str
    title: str
    tile_url_template: str
    min_zoom: int
    max_zoom: int
    tile_size: int
    projection: Optional[str] = None
    attribution: Optional[str] = None
    body: Optional[str] = None


class FeatureCategory:
    CRATER = "Crater"
    VALLIS = "Vallis"
    MONS = "Mons"
    MARE = "Mare"
    LACUS = "Lacus"
    RUPES = "Rupes"
    DORSUM = "Dorsum"
    RIMA = "Rima"
    PLANITIA = "Planitia"
    PATERA = "Patera"
    THOLUS = "Tholus"
    TERRA = "Terra"
    CHAOS = "Chaos"
    CATENA = "Catena"
    CAVUS = "Cavus"
    FLUCTUS = "Fluctus"
    FOSSA = "Fossa"
    LABYRINTHUS = "Labyrinthus"
    LINEA = "Linea"
    MENSA = "Mensa"
    OCEANUS = "Oceanus"
    PALUS = "Palus"
    PLANUM = "Planum"
    PROMONTORIUM = "Promontorium"
    REGIO = "Regio"
    SINUS = "Sinus"
    SULCUS = "Sulcus"
    TESSERA = "Tessera"
    VASTITAS = "Vastitas"
    OTHER = "Other"


class PlanetaryFeature(BaseModel):
    id: str = Field(..., description="Unique identifier")
    name: str = Field(..., description="Official IAU name")
    body: str = Field(..., description="Celestial body")
    category: str = Field(..., description="Feature type")
    lat: float = Field(..., ge=-90, le=90, description="Latitude (degrees)")
    lon: float = Field(..., ge=-180, le=180, description="Longitude (degrees)")
    diameter_km: Optional[float] = Field(None, description="Diameter in kilometers")
    origin: Optional[str] = Field(None, description="Name origin")
    approval_date: Optional[str] = Field(None, description="IAU approval date")
    keywords: List[str] = Field(default_factory=list)
    embedding: Optional[List[float]] = Field(None, description="Vector embedding")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "moon_tycho_crater",
                "name": "Tycho",
                "body": "moon",
                "category": "Crater",
                "lat": -43.31,
                "lon": -11.36,
                "diameter_km": 85.0,
                "origin": "Named after Tycho Brahe, Danish astronomer",
                "keywords": ["crater", "impact", "ray system"],
            }
        }


class FeatureEmbedding(BaseModel):
    feature_id: str
    vector: List[float]


class SearchResult(BaseModel):
    found: bool
    message: Optional[str] = None
    body: Optional[str] = None
    center: Optional[dict] = None
    feature: Optional[dict] = None
    related_features: List[dict] = Field(default_factory=list)
    total_results: Optional[int] = None
    suggestions: Optional[List[str]] = None
    parsed: Optional[dict] = None


# ====== DeepSeek API Response Schemas ======

from enum import Enum

class CelestialBodyEnum(str, Enum):
    MOON = "moon"
    MARS = "mars"
    MERCURY = "mercury"
    CERES = "ceres"
    VESTA = "vesta"
    EARTH = "earth"

class FeatureTypeEnum(str, Enum):
    CRATER = "Crater"
    MONS = "Mons"
    MONTES = "Montes"
    MARE = "Mare"
    PLANITIA = "Planitia"
    VALLIS = "Vallis"
    UNKNOWN = "Unknown"

class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"

class DeepSeekParsedQuery(BaseModel):
    """Validated schema for DeepSeek API parsed query response."""
    body: Optional[CelestialBodyEnum] = None
    feature_type: Optional[FeatureTypeEnum] = None
    feature_name: Optional[str] = None
    size_preference: Optional[str] = None
    sort: Optional[SortOrder] = None
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)

    class Config:
        use_enum_values = True
        json_schema_extra = {
            "example": {
                "body": "moon",
                "feature_type": "Crater",
                "feature_name": "Tycho",
                "size_preference": None,
                "sort": None,
                "confidence": 0.95
            }
        }

