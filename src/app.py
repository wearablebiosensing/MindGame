import io
import tempfile
import csv
import re
import os
from datetime import datetime
import json
import math

from flask import Flask, render_template, request, jsonify, redirect,url_for, Response, session
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
SAVE_FILES_TO_LOCAL_SYSTEM = True
SAVE_FILES_TO_CLOUD = False
SAVED_DATA_DIRECTORY = os.path.join("data", "")
if platform == "linux" or platform == "linux2":
    # For deployment on server
    SAVED_DATA_DIRECTORY = "/var/www/MindGamev2/src/data"







# Dictionary to hold multiple MQTT clients
mqtt_clients = {}
user_timeout = {}



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
        
def on_message(client, userdata, message, filename, watchID):
    try:
        topic_base = message.topic.split('/')[1]  # Extracts 'acceleration' or 'gyro' from the topic
        directory = f"watch_data/{topic_base}_data/"  # Creates directory path based on topic
        full_filename = f"{filename}_{topic_base}"  # Appends topic to the filename

        data = message.payload.decode()
        save_to_csv(data, directory, full_filename, watchID, get_csv_headers_from_topic(topic_base))
    except Exception as e:
        print(f"Error processing mqtt message: {e}")




# Callback for when the client disconnects from the server
def on_disconnect(client, userdata, rc):
    if rc != 0:
        print(f"Unexpected disconnection, return code: {rc}")

# Function to save data to CSV
def save_to_csv(data, dir, filename, watchID, header=None):
    # Correct directory name
    directory = os.path.join(SAVED_DATA_DIRECTORY, dir)
    
    os.makedirs(directory, exist_ok=True)

    # Correct file path
    file_path = os.path.join(directory, f"{filename}.csv")

    # Check if file exists before opening it
    file_exists = os.path.exists(file_path)
    
    
    relative_timestamp = 0
    # == Relative Timestamp == Initialize start_time if it's the first message
    if mqtt_clients[watchID]["start_time"] is None:
        mqtt_clients[watchID]["start_time"] = time.time()
    else:
        # Calculate relative timestamp
        relative_timestamp = time.time() - mqtt_clients[watchID]["start_time"]
        
    # print(relative_timestamp)

    with open(file_path, "a", newline='') as csv_file:
        csv_writer = csv.writer(csv_file)

        # Write the header only if the file did not exist and a header is provided
        if not file_exists and header is not None:
            csv_writer.writerow(header)

        # Splite the gitant string blob into each row, still also just a big string
        rows = data.split('\n')
        
        
        # 2D array each row is a row for csv
        # Each column is a entry in each row
        csv_data = [row.split(',') for row in rows]
        
        for row in csv_data:
            row.append(str(relative_timestamp))

        csv_writer.writerows(csv_data)
        
    return file_path

    # print(f"Data saved in CSV file: {file_path}")

# Modified function to start data collection for specific user
def start_data_collection(level, sub_level, userID, filename, watchID):
    # Create a new MQTT client for the user
    client = mqtt.Client()

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
    
        
    print(f"Started MQTT for watch {watchID} with filename: {filename}")
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
    
    # Generate a unique identifier for the session
    session['unique_session_identifier'] = int(time.time())
    
    
    #Filename creation
    filename = f"watch_{userID}_L{level}_S{sub_level}_{session['unique_session_identifier']}"
    logger.info(f"Starting MQTT data collection for WatchID of {watchID} for user {userID} for {level}-{sub_level}")
    
    
    #Start mqtt connection
    start_data_collection(level, sub_level, userID, filename, watchID)
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
    """API endpoint to let the frontend know if a specific watchID has timed out

    Returns:
        dict: true or false
    """
    
    #Get data from request
    res = request.get_json()
    watchID = res.get("watchID", None)
    
    if watchID == None or watchID not in user_timeout.keys():
        return jsonify({"status": False})
        
    
    start_ts = user_timeout[watchID]["start_ts"]
    current_ts = int(time.time())
    TIMOUT_IN_SECONDS = 600
    print("TIMESTAMP", current_ts - start_ts, user_timeout)
    elapsed_time = current_ts - start_ts
    if (elapsed_time) >= TIMOUT_IN_SECONDS:
        return jsonify({"status": True, "elapsed_time": elapsed_time})
    else:
        return jsonify({"status": False, "elapsed_time": elapsed_time})
    
@app.route('/mindgame_start_timer', methods=['POST'])
def mindgame_start_timer():
    """Start the 10 minute timer untill the user stops playing the game
    """
    res = request.get_json()
    watchID = res["watchID"]
    
    # Global dictionary
    user_timeout[watchID] = {"start_ts": int(time.time())}
    print(f"Starting timer for: {watchID}")

    
    return jsonify({"status": True})
    
    
@app.route('/mindgame_remove_timer', methods=['POST'])
def mindgame_remove_timer():
    """Remove the 10 minute timer
    """
    res = request.get_json()
    watchID = res["watchID"]
    
    # Global dictionary
    if watchID in user_timeout.keys():
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

@app.route('/nogo', methods=['GET','POST'])
def nogo():
    
  return render_template("nogo.html")

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
        request_data = request.get_json()
        user_id = request_data["userID"]
        data = request_data["data"]
        
        # Define the directory and ensure its existence
        directory = os.path.join(SAVED_DATA_DIRECTORY, "intake")  # Use os.path.join for cross-platform compatibility
        os.makedirs(directory, exist_ok=True)

        # Construct the file path
        timestamp = int(time.time())
        file_name = f"intake_{user_id}_{timestamp}.csv"
        file_path = os.path.join(directory, file_name)

        # Write data to CSV
        with open(file_path, "w", newline='') as csv_file:
            csv_writer = csv.writer(csv_file)
            csv_writer.writerow(["userID", "medication", "time"])
            csv_writer.writerow([user_id, data["medication"], data["time"]])
            
        logger.info(f"Sucesfully saved Medication Intake data for user {user_id}");
            
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
    
    directory = os.path.join(SAVED_DATA_DIRECTORY, fileDir)
    ensure_directory_exists(directory)
    full_path = os.path.join(directory, fileName)
    
    try:
        
        if(SAVE_FILES_TO_LOCAL_SYSTEM):
            with open(full_path, mode="w+b") as file:
                
                file.write(data)
                
                if(SAVE_FILES_TO_CLOUD):
                    file.seek(0)  # Rewind the file pointer to the beginning
                    bucket = storage.bucket()
                    blob = bucket.blob(f"MagneticTiles/{fileDir}/{fileName}") 
                    blob.upload_from_file(file_obj=file, rewind=True)
        else:
            
            if(SAVE_FILES_TO_CLOUD):
                with tempfile.NamedTemporaryFile(delete=False) as file:
                    file.write(data)
                    
                    file.seek(0)  # Rewind the file pointer to the beginning
                    bucket = storage.bucket()
                    blob = bucket.blob(f"MagneticTiles/{fileDir}/{fileName}") 
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
    
    #Retrive Data from Post request
    res = request.get_json()
    data = res["data"]
    level = res["level"] #Current level that posted data is from
    sub_level = res["sub_level"]
    userID = res["userID"] #Used to differentiate csv files from differet subjects
    time_to_complete = res["time_to_complete"]
    user_euclid_distances = res["user_euclid_movement_distances"]
    shortest_euclid_distances = res["shortest_euclid_distances"]
    window_width = res["window_width"]
    window_height = res["window_height"]
    
    logger.info(f"Processing Mouse data for user {userID} on level {level}-{sub_level}")
    logger.info(f"Shortest Euclid: {shortest_euclid_distances}\n")
    logger.info(f"User Euclid: {user_euclid_distances}\n")
    
    
    


    #Save Relevent Data to session to be used in scoring page
    session["AverageEuclidanPercentChange"] = math.floor(calculateEuclidanPercentChange(shortest_euclid_distances, user_euclid_distances))
    session["TimeToCompleteLevel"] = time_to_complete
    # session["ExpectedTimeToCompleteLevel"] = EXPECTED_TTC[level][sub_level] 
    session["ExpectedTimeToCompleteLevel"] = "N/A"
    
    
    # print("HOPE", session.get("AverageEuclidanPercentChange"))
    # print("HOPE", session.get("TimeToCompleteLevel"))
    
    
    
    unique_file_identifier =  session.get('unique_session_identifier')
    
    if not unique_file_identifier:
        logger.error("Cannot get session identifier")

    
    
    #======================================    
    #              INFO FILE
    #======================================
        
    info_file_dir = "level_info"
    info_file_name = f"info_{userID}_L{level}_S{sub_level}_{unique_file_identifier}.json"
    
    # Construct the data dictionary
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
    # Serialize the dictionary to a JSON string
    info_json = json.dumps(info_data, indent=4)
    
    # Convert JSON string to bytes, since your createAndUpload function seems to expect bytes
    info_file_data = info_json.encode("utf-8")

    # Define the string with indentation
    # info_file_string = f"""
    #     Screen Size: 
    #     {str(window_width)}x{str(window_height)}

    #     Level: 
    #     {str(level)}, {str(sub_level)}

    #     UserID: 
    #     {str(userID)}

    #     Time to Complete Level: 
    #     {time_to_complete['ttc_minutes']}:{time_to_complete['ttc_seconds']}
    # """

    # # Remove leading spaces from each line in the string
    # info_file_string = '\n'.join(line.lstrip() for line in info_file_string.splitlines())
    # info_file_data = info_file_string.encode("utf-8")
    
    #Info File
    createAndUpload(info_file_dir, info_file_name, info_file_data)
    
    

    
    

    
    #======================================    
    #              EUCLID FILES
    #======================================
    euclid_dir = "euclid"
    shortest_euclid_file_name = f"shortest_{userID}_L{level}_S{sub_level}_{unique_file_identifier}.json"
    user_euclid_file_name = f"user_{userID}_L{level}_S{sub_level}_{unique_file_identifier}.json"
    

    #Shortest Distances JSON
    shortest_euclid_data = json.dumps(shortest_euclid_distances).encode("utf-8")
    createAndUpload(euclid_dir, shortest_euclid_file_name, shortest_euclid_data)
       
        
    #User Distances JSON
    user_euclid_data = json.dumps(user_euclid_distances).encode("utf-8")
    createAndUpload(euclid_dir, user_euclid_file_name, user_euclid_data)
    
    
    
    
    
    
    
    #======================================    
    #              MOUSE FILE
    #======================================
    mouse_data_dir = "mouse_data"
    mouse_data_file_name = f"mouse_{userID}_L{level}_S{sub_level}_{unique_file_identifier}.csv"
    
    # Create the header row
    header_row = ['x', 'y', 'timestamp', 'shape', 'x(px/s^2)', 'y(px/s^2)']
    csv_data = [header_row] + data

    # Convert the accumulated data to a CSV string
    csv_data = '\n'.join([','.join(map(str, row)) for row in csv_data])
    csv_data = csv_data.encode('utf-8')
    
    #Upload Mouse Data
    createAndUpload(mouse_data_dir, mouse_data_file_name, csv_data)
    
      
        
    response = {'message': 'Data received and processed successfully'}
    return jsonify(response)


@app.route('/process-nogo-data', methods=['POST'])
def processnogo():
    """
    Endpoint to process and save data from the No-Go game.
    
    This endpoint expects a JSON payload with 'data' containing a list of dictionaries 
    with No-Go game results, and 'userID' indicating the unique identifier for the user.

    The data is saved in a CSV file within a 'nogo' directory, named using the user's ID.

    Returns:
        JSON response with a message indicating the success or failure of the operation.
    """
    try:
        # Retrieve Data from the Post request
        res = request.get_json()
        data = res.get("data")
        userID = res.get("userID")
        
        if not data or not userID:
            logger.error("Missing 'data' or 'userID' in the request payload")
            return jsonify({"error": "Missing 'data' or 'userID' in the request payload"}), 400

        # Initialize CSV output
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())

        # Write the data to the CSV string
        writer.writeheader()
        for row in data:
            writer.writerow(row)
        csv_string = output.getvalue()

        # Define the file path and ensure the directory exists
        nogo_dir = "nogo/"
        # os.makedirs(nogo_path, exist_ok=True)
        timestamp = int(time.time())
        nogo_file_name = f"nogo_{userID}_{timestamp}.csv"

        # Encode the CSV string to bytes and upload
        nogo_data = csv_string.encode("utf-8")
        createAndUpload(nogo_dir, nogo_file_name, nogo_data)
        
        logger.info(f"Successfully processed and saved No-Go data for userID {userID}")
        return jsonify({"message": "Data received and processed successfully"}), 201

    except Exception as e:
        logger.error(f"An error occurred while processing No-Go data: {e}")
        return jsonify({"error": "Internal server error"}), 500

    
    

# if __name__ == '__main__':
#     mqtt_client.loop_start()
#     socketio.run(app, debug=True)
