"""Flask application package."""

from .flight_queries import (
    get_flights_on_date,
    get_flights_between_dates,
    get_all_flights_from_origin, 
    get_unique_origins,           
    get_flights_to_destination,
    get_flight_by_ticket,
)