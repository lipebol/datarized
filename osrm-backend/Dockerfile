### Never send your "passwords" in Production ###
FROM ghcr.io/project-osrm/osrm-backend AS base-build

RUN \
    mkdir /data \
    && wget -c https://download.geofabrik.de/north-america/us/illinois-latest.osm.pbf \
    -O /data/illinois-latest.osm.pbf

# === osrm-bicycle ===
FROM base-build AS osrm-bicycle
RUN \
    osrm-extract -p /opt/bicycle.lua /data/illinois-latest.osm.pbf \
    && osrm-partition /data/illinois-latest.osrm \
    && osrm-customize /data/illinois-latest.osrm