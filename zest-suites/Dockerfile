FROM python:3.11-slim

WORKDIR /app

COPY . /app

EXPOSE 8081

ENV PYTHONUNBUFFERED=1 \
    PORT=8081

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8081/index.html')" || exit 1

CMD ["python3", "server.py"]
