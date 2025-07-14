# MindGame

![Alt text](https://github.com/wearablebiosensing/MindGame/blob/main/src/static/images/homepage_screenshot.png)

Abstract— Wearable Internet of Medical Things (IoMT) platforms are transforming remote health monitoring by enabling continuous, real-world data acquisition for chronic and neurodevelopmental conditions. However, ensuring data quality and system reliability remains a key challenge, particularly outside controlled clinical environments. Attention-Deficit/Hyperactivity Disorder (ADHD) is a neurodevelopmental disorder that affects approximately 11.8 million children in the US. While existing treatment plans can help manage symptoms, current assessment methods rely heavily on subjective clinical rating scales, which are prone to errors and may lead to inaccurate evaluations. To address this, we present MindGame, a wearable IoMT system that integrates a commercially available smartwatch (Samsung Galaxy Watch 4) and a digital puzzle game to remotely monitor ADHD related behaviors. MindGame synchronizes gameplay data with physiological signals. In this study we primarily analyse the quality of data collected from smartwatch in at-home settings. This  includes data corruption, missing values, and inconsistent adherence. We conducted a week-long study with 5 ADHD and 7 neurotypical participants, who used the system in both home and laboratory environments. Twenty seven unique puzzles were created, total of 2427 puzzles were played each puzzle was repeated for a minimum of 51 times. We analyzed four key data quality metrics: signal-to-noise ratio, percentage data loss, percentage of zeros (e.g., 0 bpm heart rate), and sample rate consistency. Our results reveal significant differences in the quality of wearable sensor and mouse movement data between home and lab settings, underscoring the need for robust data quality assessment and adaptive system design in real-world IoMT deployments for smart health.

# MindGame

This repository contains a Python Flask application in the /src.

## Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/wearablebiosensing/MindGame.git
   cd MindGame
   ```

2. **Create and activate a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   If a `req.txt` file is present:
   ```bash
   pip install -r requirements.txt
   ```
   If not, install Flask manually:
   ```bash
   pip install Flask
   ```

## Running the Application

1. **Set environment variables (optional, for development):**
   ```bash
   cd src
   export FLASK_APP=app.py
   export FLASK_ENV=development
   ```
   On Windows:
   ```cmd
   set FLASK_APP=app.py
   set FLASK_ENV=development
   ```

2. **Start the Flask server:**
   ```bash
   flask run
   ```

3. **Access the app:**
   Open your browser and visit [http://127.0.0.1:5000](http://127.0.0.1:5000)

## Notes

- The app has a depancy with the follwoing companion Galaxy Watch 4 Repository: https://github.com/wearablebiosensing/MindGameSmartWatch