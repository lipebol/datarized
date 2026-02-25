### Never send your "passwords" in Production ###

FROM docker.io/azul/zulu-openjdk:21
ENV TZ=America/Sao_Paulo
RUN \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && apt update && apt upgrade -y && apt install wget gpg -y \
    && wget -qO- https://cloud.r-project.org/bin/linux/ubuntu/marutter_pubkey.asc | \
    gpg --dearmor -o /usr/share/keyrings/r-project.gpg \
    && echo 'deb [signed-by=/usr/share/keyrings/r-project.gpg] https://cloud.r-project.org/bin/linux/ubuntu jammy-cran40/' | \ 
    tee -a /etc/apt/sources.list.d/r-project.list \
    && apt update && apt install --no-install-recommends nano clevis python3-pip python3-venv \
    python3-dbus r-base r-cran-dplyr r-cran-magrittr r-cran-lubridate r-cran-rjava r-cran-dbi -y \
    && pip install --upgrade flask-appbuilder python-dotenv pysmb psycopg2-binary \
    pymongo boto3 aiohttp requests cryptography xmltodict beautifulsoup4 gql lxml pillow \
    google-api-python-client google-auth-httplib2 google-auth-oauthlib \
    pyarrow fsspec unidecode pandas duckdb adbc_driver_manager adbc_driver_postgresql \
    apache-airflow-providers-postgres JayDeBeApi apache-airflow-providers-samba \
    apache-airflow-providers-jdbc \
    'apache-airflow==2.11.0' \
    --constraint 'https://raw.githubusercontent.com/apache/airflow/constraints-2.11.0/constraints-3.10.txt' \
    && R -e 'install.packages(c("dotenv", "RJDBC"))' \
    && mkdir -p /opt/user \
    && groupadd --system airflow \
    && useradd --base-dir /opt/user --system --gid airflow datarized \
    && chown -R datarized:airflow /opt/user
USER datarized
WORKDIR /opt/user/datarized/airflow
RUN airflow db migrate