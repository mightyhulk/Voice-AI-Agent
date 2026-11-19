FROM python:3.12-slim

# Create standard user UID 1000 for Hugging Face Spaces compatibility
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONPATH=/home/user/app/backend

WORKDIR /home/user/app

# Install dependencies
COPY --chown=user backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy application files (including pre-built React static files)
COPY --chown=user . /home/user/app

ENV PORT=7860
EXPOSE 7860

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]

