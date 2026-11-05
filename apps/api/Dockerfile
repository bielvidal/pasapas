# Multi-etapa (patró de la casa, calcat de PPER): la etapa de producció va l'ÚLTIMA.
# Els tests corren amb `--target test` (scripts/test-py.sh) sobre la MATEIXA base 3.12:
# el python del host (3.8) no serveix.
FROM python:3.12-slim AS base
WORKDIR /srv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS test
RUN pip install --no-cache-dir pytest httpx
COPY pasapas ./pasapas
COPY migrations ./migrations
COPY tests ./tests
CMD ["python", "-m", "pytest", "-q"]

FROM base AS prod
COPY pasapas ./pasapas
COPY migrations ./migrations
CMD ["uvicorn", "pasapas.api:app", "--host", "0.0.0.0", "--port", "8900", "--proxy-headers", "--no-access-log"]
