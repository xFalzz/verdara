# ==============================================================================
# Verdara Python Climate Evaluation & Physics Microservice
# Lightweight Python 3.11 Slim Production Image
# ==============================================================================

FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV APP_PORT=8000
ENV APP_HOST="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1002 climate && \
    adduser --system --uid 1002 --gid 1002 climate

COPY services/climate_eval ./services/climate_eval

RUN chown -R climate:climate /app

USER climate

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["python", "-m", "services.climate_eval.server"]
