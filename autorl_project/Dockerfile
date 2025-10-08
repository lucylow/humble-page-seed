FROM python:3.10-slim-buster

WORKDIR /usr/src/app

# Install system dependencies for Appium, Tesseract, and OpenCV
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    zlib1g-dev \
    libfreetype6-dev \
    liblcms2-dev \
    libwebp-dev \
    tesseract-ocr \
    libtesseract-dev \
    libleptonica-dev \
    pkg-config \
    python3-opencv \
    && rm -rf /var/lib/apt/lists/*

# Install Appium globally (Node.js is required for Appium CLI)
# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - &&\
    apt-get install -y nodejs

RUN npm install -g appium@next
RUN appium driver install uiautomator2
RUN appium driver install xcuitest

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
EXPOSE 8000
EXPOSE 4723

# Command to run the API server (Flask) and the main orchestrator (Python) in parallel
# This is a simplified approach for demonstration. In production, these might be separate services.
CMD sh -c "appium --address 0.0.0.0 --port 4723 --base-path /wd/hub & python3 main.py & python3 api_server.py"

