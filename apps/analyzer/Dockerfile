FROM python:3.12-slim
WORKDIR /app

COPY apps/analyzer/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/analyzer/app ./app

EXPOSE 8000
# root_path 는 코드에서 설정. 게이트웨이가 /analyze prefix 를 전달.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
