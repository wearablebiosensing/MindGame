import io
import tempfile
import csv
import re
import os
from datetime import datetime, date
import json
import math
import shutil
from flask import Flask, render_template, request, jsonify, redirect, send_from_directory,url_for, Response, session
import firebase_admin
from firebase_admin import credentials, storage, db
import pandas as pd
import numpy as np
import paho.mqtt.client as mqtt
import csv
import time
from functools import partial  # Import functools.partial
import threading
csv_lock = threading.Lock()
from sys import platform # Check if on linux or windows
import logging

#Logging setup
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create a handler that logs to console (stdout)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


#Flask Config
app = Flask(__name__)
app.secret_key = "super secret key"


#Firebase Config
cred_path = os.path.join(".", "carewear-77d8e-b0c3a74e907c.json")
if platform == "linux" or platform == "linux2":
    # For deployment on server
    cred_path = "/var/www/MindGamev2/src/carewear-77d8e-b0c3a74e907c.json"

    
cred = credentials.Certificate(cred_path) 
firebaseConfig = {
  "apiKey": "AIzaSyDyjHLuokjuGEPr3HOSsX8FP16qxyS62W8",
  "authDomain": "carewear-77d8e.firebaseapp.com",
  "databaseURL": "https://carewear-77d8e-default-rtdb.firebaseio.com",
  "projectId": "carewear-77d8e",
  "storageBucket": "carewear-77d8e.appspot.com",
  "messagingSenderId": "683558385369",
  "appId": "1:683558385369:web:1d729eff041a05d547b0c8"
}
firebase_admin.initialize_app(cred, {
        'storageBucket': 'carewear-77d8e.appspot.com',
        'databaseURL': 'https://carewear-77d8e-default-rtdb.firebaseio.com/'
})
ref = db.reference('/sensors_message')  # Path to your sensor data node in the database




#Constant
session_counter = 0
last_reset_date = date.today()
SAVE_FILES_TO_LOCAL_SYSTEM = True
SAVE_FILES_TO_CLOUD = False
SAVED_DATA_DIRECTORY = os.path.join("data", "")
if platform == "linux" or platform == "linux2":
    # For deployment on server
    SAVED_DATA_DIRECTORY = "/var/www/MindGamev2/src/data"







# Dictionary to hold multiple MQTT clients
mqtt_clients = {}
user_timeout = {}

############################AIDAN ADD##############################
def create_folder_structure(base_dir, location, user_id, session_number):

    if not all([base_dir, location, user_id, session_number]):
        app.logger.error(f"Invalid parameters for folder creation: base_dir={base_dir}, location={location}, user_id={user_id}, session_number={session_number}")
        raise ValueError("Missing required parameters for folder creation.")
    
    now = datetime.now()
    time_of_day = "Morning" if now.hour < 16 else "Evening"
    date_str = now.strftime("%Y-%m-%d")

    full_path = os.path.join(base_dir, location, user_id, time_of_day, f"session_{date_str}_{session_number}")
   # if session_number != "temp":
   #     gen_path = os.path.join(base_dir, location, user_id, time_of_day)
   #     temp_path = os.path.join(gen_path, f"session_{date_str}_temp")
   #     dest = shutil.move(temp_path, full_path)
   #     os.rmdir(temp_path)

    os.makedirs(full_path, exist_ok=True)

    return full_path

# Callback for when the client receives a CONNACK response from the server
def on_connect(client, userdata, flags, rc, watchID):
    if rc == 0:
        topic = f"{watchID}/accelerometer"
        topic2 = f"{watchID}/gyroscope"
        topic3 = f"{watchID}/heartrate"
        topic4 = f"{watchID}/linear_acceleration"
        
        print("Connected to MQTT broker on ", topic)
        print("Connected to MQTT broker on ", topic2)
        print("Connected to MQTT broker on ", topic3)
        
        
        client.subscribe(topic)
        client.subscribe(topic2)
        client.subscribe(topic3)
        client.subscribe(topic4)
        
        
        
    else:
        print(f"Failed to connect, return code: {rc}")
        
        
def get_csv_headers_from_topic(topic: str):
    """Ouputs the correct csv header for a specific topic of data

    Args:
        topic (str)

    Returns:
        list[str]: list of headers to be written to the csv
    """
    
    if(topic == "accelerometer"):
        return ["x(m/s^2)", "y(m/s^2)", "z(m/s^2)", "internal_ts", "watch_timestamp", "relative_timestamp"]
    
    if(topic == "gyroscope"):
        return ["x(rad)", "y(rad)", "z(rad)", "internal_ts", "watch_timestamp", "relative_timestamp"]
    
    if(topic == "heartrate"):
        return ["bpm", "internal_ts", "watch_timestamp", "relative_timestamp"]
    
    if(topic == "linear_acceleration"):
        return ["x(m/s^2)", "y(m/s^2)", "z(m/s^2)", "internal_ts", "watch_timestamp", "relative_timestamp"]
 ##################################### AIDAN EDIT #############################################       
def on_message(client, userdata, message, filename, watchID):
    try:
        topic_base = message.topic.split('/')[1]  # Extracts 'acceleration' or 'gyro' from the topic
        data = message.payload.decode()

        # Ensure userdata has session_number
        session_number = user_timeout.get(watchID, {}).get("session_number", 0)
        if session_number == 0:
            raise ValueError("Missing session number for data processing")
        
        # Check if userdata is None before accessing its properties
        if userdata is None:
            logger.error("userdata is None in on_message function")
            return
        # Retrieve level and sub_level from userdata
        level = userdata.get('level')
        sub_level = userdata.get('sub_level')
        
        location = userdata.get('location')
        user_id = userdata.get('user_id')
        filename = userdata.get('filename')
        
        if not all([location, user_id, filename, level, sub_level]):
            logger.error(f"Missing data in userdata. Location: {location}, User ID: {user_id}, Level: {level}, Sub-level: {sub_level}")
            return
        
        base_dir = SAVED_DATA_DIRECTORY
        session_folder = create_folder_structure(base_dir, location, user_id, session_number)

        # Create the watch_data directory within the session folder
        watch_data_dir = os.path.join(session_folder, "watch_data")
        topic_dir = os.path.join(watch_data_dir, f"{topic_base}_data")
        os.makedirs(topic_dir, exist_ok=True)

        # Create the full filename with .csv extension
        full_filename = f"watch_{user_id}_L{level}_S{sub_level}_{topic_base}.csv"
        file_path = os.path.join(topic_dir, full_filename)

        # Save the data to CSV
        save_to_csv(data, file_path, watchID, get_csv_headers_from_topic(topic_base))

        #logger.info(f"Watch data saved for {topic_base} in {file_path}")

    except Exception as e:
        logger.error(f"Error processing mqtt message for watchID {watchID}: {str(e)}")
 ##################################### AIDAN EDIT END #############################################  



# Callback for when the client disconnects from the server
def on_disconnect(client, userdata, rc):
    if rc != 0:
        print(f"Unexpected disconnection, return code: {rc}")

# Function to save data to CSV
def save_to_csv(data, file_path, watchID, header=None):
    # Ensure the directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    relative_timestamp = 0
    # Initialize start_time if it's the first message
    if mqtt_clients[watchID]["start_time"] is None:
        mqtt_clients[watchID]["start_time"] = time.time()
    else:
        # Calculate relative timestamp
        relative_timestamp = time.time() - mqtt_clients[watchID]["start_time"]

    # Check if file exists before opening it
    file_exists = os.path.exists(file_path)

    with open(file_path, "a", newline='') as csv_file:
        csv_writer = csv.writer(csv_file)

        # Write the header only if the file did not exist and a header is provided
        if not file_exists and header is not None:
            csv_writer.writerow(header)

        # Split the giant string blob into each row, still also just a big string
        rows = data.split('\n')
        
        # 2D array each row is a row for csv
        # Each column is an entry in each row
        csv_data = [row.split(',') for row in rows if row]  # Skip empty rows
        
        for row in csv_data:
            row.append(str(relative_timestamp))

        csv_writer.writerows(csv_data)
        
    return file_path

    # print(f"Data saved in CSV file: {file_path}")

# Modified function to start data collection for specific user
def start_data_collection(level, sub_level, userID, filename, watchID, location):
    # Create a new MQTT client for the user
    client = mqtt.Client(userdata={
        'location':location,
        'user_id': userID, 
        'filename': filename, 
        'level': level, 
        'sub_level': sub_level,
        'watchID': watchID
        })
    
    # Retrieve the session number
    session_number = get_session_number(userID, location)
    if session_number == 0:
        raise ValueError("Session number is missing or invalid")

    # Update filename with session number
    filename = f"watch_{userID}_L{level}_S{sub_level}_Session{session_number}_{int(time.time())}"


    # Set up callbacks
    client.on_connect = partial(on_connect, watchID=watchID)
    client.on_message = partial(on_message, filename=filename, watchID=watchID)
    client.on_disconnect = on_disconnect

    # Connect the client
    client.connect("broker.hivemq.com", 1883)
    client.loop_start()

    # Store the client in the dictionary
    #Need to also store filename, so when mqttstop is called we can then
    #Save the same file to firebase, maybe use an obj {"client": client, "filename": filename}
    mqtt_clients[watchID] = {"client": client, "filename": filename, "start_time": None}
    
        
    logger.info(f"Started MQTT for watch {watchID} with filename: {filename}")
    logger.debug(f"MQTT client userdata: {client._userdata}")
    print("All current clients: ", mqtt_clients)

# Modified function to stop data collection for specific user
def stop_data_collection(watchID):
    print(mqtt_clients)
    if watchID in mqtt_clients:
        print(f"Stopping MQTT data collection for watchID {watchID}")
        mqtt_clients[watchID]["client"].disconnect()
        mqtt_clients[watchID]["client"].loop_stop()
        
        #Save CSV to firebase
        filename = mqtt_clients[watchID]["filename"]
        # filepath = save_to_csv("", filename) #Make sure correct filepath
        
        # if(os.path.exists(filepath) == False):
        #     print(f"File not found at {filepath}")
        #     return
        
        # print(filepath)
        # upload_csv_to_firebase(filepath, f"MagneticTiles/watch_data/{filename}")
        
        #Delete client
        del mqtt_clients[watchID]
    else:
        print(f"No MQTT client found for user {watchID}")

# Flask route to start MQTT data collection
@app.route("/start_mqtt", methods=['GET', 'POST'])
def start_mqtt_collection():
    
    #Get data from request
    res = request.get_json()
    level = res["level"]
    sub_level = res["sub_level"]
    userID = res["userID"]
    watchID = res["watchID"]
    location = res["location"] # Make sure this is being sent from the frontend
    
    # Generate a unique identifier for the session
    session['unique_session_identifier'] = int(time.time())
    
    
    #Filename creation
    filename = f"watch_{userID}_L{level}_S{sub_level}_{session['unique_session_identifier']}"
    logger.info(f"Starting MQTT data collection for WatchID of {watchID} for user {userID} for {level}-{sub_level}")
    
    
    #Start mqtt connection
    start_data_collection(level, sub_level, userID, filename, watchID, location)
    return "", 201

# Flask route to stop MQTT data collection
@app.route("/stop_mqtt", methods=['GET', 'POST'])
def stop_mqtt_collection():
    """API endpoint to let the frontent disconnect the connection to the
    mqtt client that is reciving data from the watch
    """

    #Get data from request
    res = request.get_json()
    watchID = res["watchID"]
         
    logger.info(f"Stopping MQTT data collection for WatchID of {watchID}")
    stop_data_collection(watchID)
    return "", 201



@app.route("/check_timeout_status", methods=['POST'])
def check_timeout_status():
    res = request.get_json()
    watchID = res.get("watchID", None)

    if watchID is None or watchID not in user_timeout.keys():
        return jsonify({"status": False})

    start_ts = user_timeout[watchID]["start_ts"]
    session_number = user_timeout[watchID]["session_number"]
    current_ts = int(time.time())
    elapsed_time = current_ts - start_ts

    if elapsed_time >= 600:
        return jsonify({"status": True, "session_number": session_number, "elapsed_time": elapsed_time})
    else:
        return jsonify({"status": False, "session_number": session_number, "elapsed_time": elapsed_time})

    
@app.route('/mindgame_start_timer', methods=['POST'])
def mindgame_start_timer():
    """Start the 10-minute timer until the user stops playing the game, tracking sessions in a JSON file."""
    try:
        res = request.get_json()

        # Ensure both watchID and userID are provided
        if "watchID" not in res or "UserID" not in res:
            return jsonify({"status": False, "error": "Missing required fields: watchID or UserID"}), 400

        watchID = res["watchID"]
        userID = res["UserID"]  # Use this for folder and file naming
        location = res.get("location", "UNKNOWN")

        # Base directory for storing user data
        base_dir = SAVED_DATA_DIRECTORY
        current_date = datetime.now().strftime("%Y-%m-%d")
        time_of_day = "Morning" if datetime.now().hour < 16 else "Evening"
        json_file_name = f"{userID}_session_info.json"

        # Determine the folder path using userID
        folder_path = os.path.join(base_dir, location, userID, time_of_day)
        json_file_path = os.path.join(folder_path, json_file_name)

        # Initialize session data
        session_number = 1
        user_data = {"USER ID": userID, "SESSIONS": []}

        # Check if the JSON file exists
        if os.path.exists(json_file_path):
            with open(json_file_path, 'r') as f:
                user_data = json.load(f)
            session_number = len(user_data["SESSIONS"]) + 1
        else:
            os.makedirs(folder_path, exist_ok=True)

        # Add the new session data
        session_data = {
            "TIME PLAYED": current_date,
            "TIME OF DAY": time_of_day,
            "LOCATION": location,
            "CURRENT SESSION": session_number
        }
        user_data["SESSIONS"].append(session_data)

        # Save the updated metadata back to the JSON file
        with open(json_file_path, 'w') as f:
            json.dump(user_data, f, indent=4)

        # Store session_number in a global or user-specific state
        user_timeout[watchID] = {"session_number": session_number, "start_ts": int(time.time())}

        app.logger.info(f"Started timeout timer for UserID: {userID}, location: {location}, session: {session_number}")
        return jsonify({"status": True, "session_number": session_number})

    except Exception as e:
        app.logger.error(f"Error in /mindgame_start_timer: {str(e)}")
        return jsonify({"status": False, "error": "An error occurred while starting the timer"}), 500

    
    
@app.route('/mindgame_remove_timer', methods=['POST'])
def mindgame_remove_timer():
    """Remove the 10 minute timer
    """
    res = request.get_json()
    watchID = res["watchID"]
    print("ATTEMPTING TO Remove timeout timer for ID: ", watchID)
    
    
    # Global dictionary
    if watchID in user_timeout.keys():
        print("SUCCESS Removed timeout timer for ID: ", watchID)
        
        del user_timeout[watchID]

    
    return jsonify({"status": True})



@app.route("/check_mqtt_connection", methods=['GET', 'POST'])
def check_mqtt_connection():
    """API endpoint to let the frontend know if a specific watchID is connected and 
    sending data to one of our mqtt topics

    Returns:
        dict: online or offline
    """
    
    #Get data from request
    res = request.get_json()
    watchID = res["watchID"]
    logger.info(f"Checking MQTT watch connection for WatchID of {watchID}")
    
    
    if check_watch_activity(watchID):
        response = {'status': "online"}
        return jsonify(response)
    else:
        response = {'status': "offline"}
        # response = {'status': "online"} For testing without watch
        
        return jsonify(response)
    


def check_watch_activity(watch_id, timeout=5):
    """
    Check if a specific topic is receiving data.

    Args:
    watch_id (str): The ID of the watch.
    timeout (int): Time in seconds to wait for a message (Default 5s)

    Returns:
    bool: True if the topic is active, False otherwise.
    """
    client = mqtt.Client()
    message_received = False

    def on_message(client, userdata, message):
        nonlocal message_received
        logging.info(f"Message received on topic {message.topic}")
        message_received = True
        client.disconnect()  # Ensure disconnection after receiving a message

    client.on_message = on_message
    client.connect("broker.hivemq.com", 1883, 60)
    client.subscribe(f"{watch_id}/gyroscope") # Any topic that we send data on

    client.loop_start()
    start_time = time.time()
    while not message_received and time.time() - start_time < timeout:
        time.sleep(0.1)  # Short sleep to yield control and wait efficiently

    client.loop_stop()
    client.disconnect()  # Ensure disconnection even if no message is received

    return message_received






#User inputs ID they see on watch
#Watch will be publishing on the topic /acceleration/id
#Start_mqtt we will send the ID from the watch so we will listen on the right topic /acceleration/id



@app.route('/favicon.ico',methods=['GET'])
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'images/favicon.ico')

@app.route('/')
@app.route('/landing')
def home():
  return render_template("landing_page.html")

@app.route('/mindgame_precheck', methods=['GET','POST'])
def mindgame_precheck():
  return render_template("mindgame_precheck.html")


@app.route('/tiles_game', methods=['GET','POST'])
def tiles_game():
  return render_template("tiles.html")


@app.route('/updated_scoring', methods=['GET','POST'])
def updated_scoring():
  return render_template("updated_scoring.html")


@app.route('/tutorial', methods=['GET','POST'])
def tutorial():
  return render_template("tutorial.html")

@app.route('/cpt', methods=['GET','POST'])
def cpt():
    
  return render_template("cpt.html")

@app.route('/intake', methods=['GET','POST'])
def intake(type: str):
  return render_template("medication_intake.html")

@app.route('/start_application/<string:type>', methods=['GET','POST'])
def start_application(type: str):
    
    #Just as a sanity check, make sure watch is sending mqtt data
    # watchID = request.args.get('watchID', "")
    # if check_watch_activity(watchID, 2) == False:
    #     return render_template("landing_page.html")
        
    return render_template("medication_intake.html", type = type)



@app.route('/intake_data', methods=['GET', 'POST'])
def intake_data():
    """
    Endpoint to intake medication data for a user.
    Extracts JSON data from the request, creates a directory if it doesn't exist, 
    and writes the data into a CSV file named after the user ID.

    Returns:
        dict-> Status:Message
    """
    try:
        # Attempt to get JSON data from the request
        print("Raw request data:", request.get_data())
        print("Request JSON:", request.get_json())
        res = request.get_json()
        userID = res["userID"]
        data = res["data"]
        location = res["location"]
        watchID = res.get("watchID")
        print(f"Parsed data - userID: {userID}, data: {data}, location: {location}")

        logger.info(f"Processing Intake data for user {userID} from {location}")

        # Retrieve the session number
        session_number = get_session_number(userID, location) + 1
        if session_number == 0:
            raise ValueError("Session number is missing or invalid")

        base_dir = SAVED_DATA_DIRECTORY
        session_folder = create_folder_structure(base_dir, location, userID, session_number)
        
        # Define the directory and ensure its existence
        directory = os.path.join(session_folder, "intake")  # Use os.path.join for cross-platform compatibility
        os.makedirs(directory, exist_ok=True)

        # Construct the file path
        timestamp = int(time.time())
        file_name = f"intake_{userID}_{timestamp}.csv"
        file_path = os.path.join(directory, file_name)

        # Write data to CSV
        with open(file_path, "w", newline='') as csv_file:
            csv_writer = csv.writer(csv_file)
            csv_writer.writerow(["userID", "medication", "time"])
            csv_writer.writerow([userID, data["medication"], data["time"]])
            
        logger.info(f"Sucesfully saved Medication Intake data for user {userID}")
            
        # Optionally, return a success message or JSON data
        return jsonify({"message": "Data intake successful"}), 201
    except KeyError as e:
        # Log missing key errors and return an error response
        logger.error(f"Missing key in the request data: {e}")
        return jsonify({"error": "Bad request, missing key in the JSON data"}), 400
    except Exception as e:
        # Log unexpected errors and return a generic error response
        logger.error(f"An error occurred: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Helper Functions 

def get_session_number(user_id, location):
    """Retrieve the current session number from the metadata file."""
    try:
        base_dir = SAVED_DATA_DIRECTORY
        time_of_day = "Morning" if datetime.now().hour < 16 else "Evening"
        folder_path = os.path.join(base_dir, location, user_id, time_of_day)
        json_file_path = os.path.join(folder_path, f"{user_id}_session_info.json")

        if os.path.exists(json_file_path):
            with open(json_file_path, 'r') as f:
                user_data = json.load(f)
            return len(user_data["SESSIONS"])
        else:
            return 0  # No sessions exist yet
    except Exception as e:
        logger.error(f"Error retrieving session number for {user_id}: {str(e)}")
        return 0

def calculateEuclidanPercentChange(shortestData: dict, userData:dict) -> float:
    """
        Calculates the average percent change between the shortest path the shapes could take
        compared the the users path
    Args:
        shortestData (dict): Key is the shape, value is the euclidan distance
        userData (dict): Key is the shape, value is the euclidan distance

    Returns:
        float: The averaged percent change for the distances moved
    """
    percent_change_acc = 0
    total_shapes = 0
    
    for key in shortestData.keys():
        shortestDistance = shortestData[key]
        userDistance = userData[key]
        # print("Percent Change values ", shortestDistance, ", ", userDistance)
        
        percent_change = (abs(shortestDistance - userDistance) / ((shortestDistance + userDistance) / 2)) * 100
        # percent_change = (abs(shortestDistance - userDistance) / ((shortestDistance)) * 100
        
        percent_change_acc += percent_change
        total_shapes += 1
        # print(f"Percent Change for {key} = {percent_change}")
        
    averaged_percent_change = percent_change_acc / total_shapes
    # print(f"Averaged Percent Change = {averaged_percent_change}")
    return averaged_percent_change




def ensure_directory_exists(directory):
    try:
        os.makedirs(directory, exist_ok=True)
    except Exception as e:
        logger.error(f"An error occurred while creating directory {directory}: {e}")

    
    
def upload_csv_to_firebase(file_path, firebase_path):
    """
    Uploads a CSV file to Firebase Storage.
    
    Args:
        file_path (str): Path to the local CSV file.
        firebase_path (str): Path in Firebase Storage where the file will be stored.
    """
    bucket = storage.bucket()
    blob = bucket.blob(firebase_path)
    
    if(os.path.exists(file_path) == False):
        logger.error(f"The file {file_path} does not exist")
        return
    
    with open(file_path, 'rb') as file:
        blob.upload_from_file(file)
        
    if(SAVE_FILES_TO_LOCAL_SYSTEM == False):
        #Delete CSV
        if os.path.exists(file_path):
            os.remove(file_path)
        else:
            logger.error(f"The file {file_path} does not exist when trying to remove")
        
        
    
def createAndUpload(fileDir: str, fileName: str, data: bytes):
    """Abstracts the way we create the data files and upload
    them to Firebase

    Args:
        filePath (str): Sub folder to put the file in
        fileName (_type_): name of the file
        data (_type_): utf8 encoded bytes??
    """
    full_path = os.path.join(fileDir, fileName)
    
    try:
        
        if(SAVE_FILES_TO_LOCAL_SYSTEM):
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, mode="w+b") as file:
                file.write(data)
                
                if(SAVE_FILES_TO_CLOUD):
                    file.seek(0)  # Rewind the file pointer to the beginning
                    bucket = storage.bucket()
                    blob = bucket.blob(f"MagneticTiles/{full_path}") 
                    blob.upload_from_file(file_obj=file, rewind=True)
        else:
            
            if(SAVE_FILES_TO_CLOUD):
                with tempfile.NamedTemporaryFile(delete=False) as file:
                    file.write(data)
                    
                    file.seek(0)  # Rewind the file pointer to the beginning
                    bucket = storage.bucket()
                    blob = bucket.blob(f"MagneticTiles/{full_path}") 
                    blob.upload_from_file(file_obj=file, rewind=True)
        
            
    except Exception as e:
        logger.error(f"An error occurred (createAndUpload):({fileName}) -> {str(e)}")






# Specify the expected time to complete Level
EXPECTED_TTC = {
    #-- Level --
    1:{
        #-- SubLevel --
        
        #Train
        1: {
            "minutes": 0,
            "seconds" : 33,
        },
        
        2: {
            "minutes": 0,
            "seconds" : 25,
        },
        3: {
            "minutes": 0,
            "seconds" : 24,
        },
    },
    
    
    #Level 2
    2:{
        #-- SubLevel --
        

        1: {
            "minutes": 0,
            "seconds" : 24,
        },
        
        2: {
            "minutes": 0,
            "seconds" : 23,
        },
        3: {
            "minutes": 0,
            "seconds" : 31,
        },
    },
    
    #Level
    3:{
        #-- SubLevel --
        

        1: {
            "minutes": 0,
            "seconds" : 10,
        },
        
        2: {
            "minutes": 0,
            "seconds" : 20,
        },
        3: {
            "minutes": 0,
            "seconds" : 30,
        },
    }
    
}


@app.route('/process-mouse-data', methods=['POST'])
def processMouseMovementData():
    try:
        # Retrieve Data from Post Request
        res = request.get_json()
        logger.info(f"Received mouse data: {res}")
        
        # Extract necessary fields
        data = res["data"]
        level = res["level"]
        sub_level = res["sub_level"]
        userID = res["userID"]
        location = res["location"]
        watchID = res.get("watchID", "unknown_watch")
        time_to_complete = res["time_to_complete"]
        user_euclid_distances = res["user_euclid_movement_distances"]
        shortest_euclid_distances = res["shortest_euclid_distances"]
        window_width = res["window_width"]
        window_height = res["window_height"]

        # Log processing info
        logger.info(f"Processing mouse data for user {userID}, level {level}-{sub_level}")

        # Retrieve the session number
        session_number = get_session_number(userID, location)
        if session_number == 0:
            raise ValueError("Session number is missing or invalid")
        
        # Create session folder
        base_dir = SAVED_DATA_DIRECTORY
        session_folder = create_folder_structure(base_dir, location, userID, session_number)

        # Use the session folder for all file operations
        info_file_dir = os.path.join(session_folder, "level_info")
        mouse_data_dir = os.path.join(session_folder, "mouse_data")
        euclid_dir = os.path.join(session_folder, "euclid")
        unique_file_identifier = session.get('unique_session_identifier', int(time.time()))

        # ======================================    
        #              INFO FILE
        # ======================================
        info_file_name = f"info_{userID}_L{level}_S{sub_level}_{unique_file_identifier}.json"
        info_data = {
            "ScreenSize": {
                "width": window_width,
                "height": window_height
            },
            "Level": {
                "main": level,
                "sub": sub_level
            },
            "UserID": userID,
            "TimeToCompleteLevel": f"{time_to_complete['ttc_minutes']}:{time_to_complete['ttc_seconds']}"
        }
        info_json = json.dumps(info_data, indent=4)
        info_file_data = info_json.encode("utf-8")
        createAndUpload(info_file_dir, info_file_name, info_file_data)

        # ======================================    
        #              EUCLID FILES
        # ======================================
        shortest_euclid_file_name = f"shortest_{userID}_L{level}_S{sub_level}_{unique_file_identifier}.json"
        user_euclid_file_name = f"user_{userID}_L{level}_S{sub_level}_{unique_file_identifier}.json"
        createAndUpload(euclid_dir, shortest_euclid_file_name, json.dumps(shortest_euclid_distances).encode("utf-8"))
        createAndUpload(euclid_dir, user_euclid_file_name, json.dumps(user_euclid_distances).encode("utf-8"))

        # ======================================    
        #              MOUSE FILE
        # ======================================
        mouse_data_file_name = f"mouse_{userID}_L{level}_S{sub_level}_{unique_file_identifier}.csv"
        header_row = ['x', 'y', 'timestamp', 'shape', 'x(px/s^2)', 'y(px/s^2)', 'progress']

        # Ensure correct structure and retain only progress values
        updated_data = []
        for row in data:
            if len(row) < 7:
                row.append("null")  # Ensure progress column exists

            updated_data.append(row)

        # Convert updated data into CSV format
        csv_data = [header_row] + [list(map(str, row)) for row in updated_data]
        csv_content = '\n'.join([','.join(row) for row in csv_data])

        # Debugging logs
        logger.info(f"Saving Mouse Data to: {mouse_data_dir}/{mouse_data_file_name}")
        logger.info(f"First 5 Rows of Mouse Data:\n{csv_data[:5]}")

        # Save updated mouse data
        createAndUpload(mouse_data_dir, mouse_data_file_name, csv_content.encode("utf-8"))
    
        # ======================================    
        #      SHAPE PLACEMENT ANALYSIS (NEW)
        # ======================================
        csv_file_path = os.path.join(mouse_data_dir, mouse_data_file_name)
        analyzeShapePlacement(csv_file_path)  # Call analysis function

        logger.info(f"Mouse data successfully saved for user {userID}, level {level}-{sub_level}")
        return jsonify({'message': 'Mouse data processed successfully'})

    except Exception as e:
        logger.error(f"Error processing mouse data: {e}")
        return jsonify({'error': 'Failed to process mouse data'}), 500


def analyzeShapePlacement(csv_file_path):
    """Analyze shape placements based on CSV data and create a summary file."""
    try:
        placements = []
        with open(csv_file_path, 'r') as file:
            reader = csv.reader(file)
            headers = next(reader)  # Read the header row

            # Find necessary column indexes
            shape_idx = headers.index("shape")
            progress_idx = headers.index("progress")
            timestamp_idx = headers.index("timestamp")

            # Tracking variables
            current_shape = None
            stroke_start_time = None
            progress_start = None
            progress_end = None
            placement_successful = False
            had_no_shape = True  # Track whether no shape was held at all

            for row in reader:
                shape = row[shape_idx]
                timestamp = row[timestamp_idx]
                progress = float(row[progress_idx]) if row[progress_idx] != "null" else 0

                if shape == "END_OF_STROKE":
                    # Finalize last shape placement check
                    if current_shape is not None:
                        if progress_end > progress_start:
                            placement_successful = True

                        # Store shape placement data
                        placements.append({
                            "shape": current_shape,
                            "start_time": stroke_start_time,
                            "end_time": timestamp,
                            "progress_before": progress_start,
                            "progress_after": progress_end,
                            "correct_placement": placement_successful
                        })
                        had_no_shape = False  # There was at least one valid shape held

                    else:
                        # No shape was held for this stroke
                        placements.append({
                            "shape": "No Shape",
                            "start_time": stroke_start_time if stroke_start_time else timestamp,
                            "end_time": timestamp,
                            "progress_before": progress_start if progress_start else 0.0,
                            "progress_after": progress_end if progress_end else 0.0,
                            "correct_placement": False
                        })

                    # Reset tracking variables
                    current_shape = None
                    stroke_start_time = None
                    progress_start = None
                    progress_end = None
                    placement_successful = False

                else:
                    # Track shape held and progress values
                    if shape != "null":
                        if current_shape is None:
                            current_shape = shape
                            stroke_start_time = timestamp
                            progress_start = progress
                        progress_end = progress

        # Ensure that if no shape placements were detected, we still log a "No Shape" entry
        if had_no_shape and not placements:
            placements.append({
                "shape": "No Shape",
                "start_time": "N/A",
                "end_time": "N/A",
                "progress_before": 0.0,
                "progress_after": 0.0,
                "correct_placement": False
            })

        # Save analyzed data as a JSON file
        summary_file = csv_file_path.replace(".csv", "_placement_summary.json")
        with open(summary_file, "w") as json_file:
            json.dump(placements, json_file, indent=4)

        logger.info(f"Shape placement summary saved: {summary_file}")
        return summary_file

    except Exception as e:
        logger.error(f"Error analyzing shape placements: {e}")
        return None




########################## AIDAN EDIT END ###############################################

@app.route('/process-cpt-data', methods=['POST'])
def process_cpt_data():
    try:
        # Extract data from the request
        data = request.json.get('data', [])
        user_id = request.json.get('userID', 'unknown_user')
        location = request.json.get('location', 'unknown_location')
        filename = request.json.get('filename', 'cpt')
        watch_id = request.json.get('watchID', 'unknown_watch')
        is_test = request.json.get('isTest', False)  # Flag to indicate testing mode

        # Retrieve the session number
        session_number = get_session_number(user_id, location) + 1
        if session_number == 0:
            raise ValueError("Session number is missing or invalid")

        # Construct filenames
        timestamp = int(datetime.now().timestamp())
        file_suffix = "test" if is_test else "session"
        full_filename_csv = f"{filename}_{file_suffix}_{user_id}_{timestamp}.csv"
        full_filename_json = f"{filename}_{file_suffix}_{user_id}_{timestamp}.json"

        # Ensure essential fields exist
        if not data or not all([user_id, location, filename]):
            return jsonify({"success": False, "message": "Missing required data"}), 400

        # Define base directory and session details
        base_dir = SAVED_DATA_DIRECTORY
        session_folder = create_folder_structure(base_dir, location, user_id, session_number)

        # Create the CPT-specific subfolder
        cpt_data_dir = os.path.join(session_folder, "cpt_data")
        os.makedirs(cpt_data_dir, exist_ok=True)

        # Construct the file paths
        timestamp = int(datetime.now().timestamp())
        full_filename_csv = f"{filename}_{user_id}_{timestamp}.csv"
        full_filename_json = f"{filename}_{user_id}_{timestamp}.json"
        file_path_csv = os.path.join(cpt_data_dir, full_filename_csv)
        file_path_json = os.path.join(cpt_data_dir, full_filename_json)

        # Metrics Initialization
        omission_errors = 0
        commission_errors = 0
        hit_reaction_times = []
        isi_metrics = {1000: [], 2000: [], 4000: []}

        # Transform and Save the Data to CSV
        with open(file_path_csv, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['type', 'clicked', 'correct', 'start_ts', 'end_ts', 'ttc', 'isi'])  # Header row
            
            for entry in data:
                # Retrieve trial data
                stimulus = entry['stimulus']
                clicked = entry.get('clicked', False)
                correct = entry.get('correct', 0)
                ttc = entry.get('ttc')
                isi = entry.get('isi', 1000)  # Default ISI if not provided

                # Update Metrics
                if stimulus != 'X' and not clicked:
                    omission_errors += 1
                if stimulus == 'X' and clicked:
                    commission_errors += 1
                if correct and ttc:
                    hit_reaction_times.append(int(ttc.replace(" ms", "")))
                    isi_metrics[isi].append(int(ttc.replace(" ms", "")))

                # Write row
                writer.writerow([stimulus, clicked, correct, entry.get('start_ts'), entry.get('end_ts'), ttc, isi])

        # Calculate Overall Metrics
        avg_hit_reaction_time = np.mean(hit_reaction_times) if hit_reaction_times else None
        reaction_time_std_dev = np.std(hit_reaction_times) if hit_reaction_times else None

        # ISI-Specific Metrics
        isi_summary = {
            isi: {
                'avg_reaction_time': np.mean(times) if times else None,
                'std_dev': np.std(times) if times else None
            } for isi, times in isi_metrics.items()
        }

        # Create the JSON payload
        metrics = {
            "omission_errors": omission_errors,
            "commission_errors": commission_errors,
            "avg_reaction_time": avg_hit_reaction_time,
            "reaction_time_std_dev": reaction_time_std_dev,
            "isi_metrics": isi_summary
        }

        json_output = {
            "data": data,
            "metrics": metrics
        }

        # Save JSON data to file
        with open(file_path_json, mode='w') as json_file:
            json.dump(json_output, json_file, indent=4)

        # Log metrics
        logger.info(f"Omission Errors: {omission_errors}, Commission Errors: {commission_errors}")
        logger.info(f"Avg Reaction Time: {avg_hit_reaction_time}, Std Dev: {reaction_time_std_dev}")
        logger.info(f"ISI Metrics: {isi_summary}")

        return jsonify({
            "success": True,
            "message": "CPT data saved successfully",
            "files": {
                "csv": full_filename_csv,
                "json": full_filename_json
            },
            "metrics": metrics
        })
    
    except Exception as e:
        logger.error(f"Error saving CPT data: {str(e)}")
        return jsonify({"success": False, "message": "An error occurred while saving CPT data"}), 500
