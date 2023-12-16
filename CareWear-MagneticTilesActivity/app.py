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
# import scipy.signal as signal
import matplotlib
matplotlib.use('Agg')
from matplotlib import pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from flask_socketio import SocketIO
import paho.mqtt.client as mqtt
import csv
import time
from functools import partial  # Import functools.partial
import threading
csv_lock = threading.Lock()

#Flask Config
app = Flask(__name__)
# socketio = SocketIO(app)
app.secret_key = "super secret key"


#Firebase Config
cred = credentials.Certificate('./carewear-77d8e-b0c3a74e907c.json') 
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







#####################
# CORE_MQTT.py
#####################


# Create an MQTT client
client = mqtt.Client()


# Callback for when the client receives a CONNACK response from the server
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker")
        client.subscribe("AndroidWatch/acceleration/dea81fff")
    else:
        print(f"Failed to connect, return code: {rc}")

# Callback for when a PUBLISH message is received from the server
def on_message(client, userdata, message, filename):
    print(f"Message received on topic {message.topic}")
    if message.topic == "AndroidWatch/acceleration/dea81fff":
        acc_data_msg = message.payload.decode()
        save_to_csv(acc_data_msg, filename)

# Callback for when the client disconnects from the server
def on_disconnect(client, userdata, rc):
    if rc != 0:
        print(f"Unexpected disconnection, return code: {rc}")

# Function to save data to CSV
def save_to_csv(data, filename, header=None):
    # Correct directory name
    directory = "watch_data/"
    os.makedirs(directory, exist_ok=True)

    # Correct file path
    file_path = f"{directory}{filename}.csv"

    # Check if file exists before opening it
    file_exists = os.path.exists(file_path)

    with open(file_path, "a", newline='') as csv_file:
        csv_writer = csv.writer(csv_file)

        # Write the header only if the file did not exist and a header is provided
        if not file_exists and header is not None:
            csv_writer.writerow(header)

        csv_writer.writerow([data])

    print(f"Data saved in CSV file: {file_path}")

# Start data collection and connect to MQTT broker
def start_data_collection(level, sub_level, userID, filename):
    print("Adding Mqtt callbacks")
    client.on_connect = on_connect
    client.on_message = partial(on_message, filename=filename) #Also send current filename
    # client.on_message = on_message #Also send current filename
    client.on_disconnect = on_disconnect
    client.connect("test.mosquitto.org", 1883)
    client.loop_start()

# Stop data collection
def stop_data_collection():
    print("Stoping Mqtt data collection")
    client.disconnect()
    client.loop_stop()

# Flask route to start MQTT data collection
@app.route("/start_mqtt", methods=['GET', 'POST'])
def start_mqtt_collection():
    
    #Get data from request
    res = request.get_json()
    level = res["level"]
    sub_level = res["sub_level"]
    userID = res["userID"]
    
    #Filename creation
    session_filename = f"{level}_{sub_level}_{userID}_{int(time.time())}"
    session['filename'] = session_filename
    print("Started Mqtt with filename : ", session_filename)
    
    #Start mqtt connection
    start_data_collection(level, sub_level, userID, session_filename)
    return "", 201

# Flask route to stop MQTT data collection
@app.route("/stop_mqtt", methods=['GET', 'POST'])
def stop_mqtt_collection():
    session_filename = session.get('filename')
    if session_filename:
        stop_data_collection()
    return "", 201


#User inputs ID they see on watch
#Watch will be publishing on the topic /acceleration/id
#Start_mqtt we will send the ID from the watch so we will listen on the right topic /acceleration/id



@app.route('/')
@app.route('/landing')
def home():
  return render_template("landing_page.html")


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




# Helper Functions 
def calculateEuclidanPercentChange(shortestData: dict, userData:dict) -> float:
    """
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
        print("Percent Change values ", shortestDistance, ", ", userDistance)
        
        percent_change = (abs(shortestDistance - userDistance) / ((shortestDistance + userDistance) / 2)) * 100
        # percent_change = (abs(shortestDistance - userDistance) / ((shortestDistance)) * 100
        
        percent_change_acc += percent_change
        total_shapes += 1 #Used in average
        print(f"Percent Change for {key} = {percent_change}")
        
    averaged_percent_change = percent_change_acc / total_shapes
    print(f"Averaged Percent Change = {averaged_percent_change}")
    return averaged_percent_change




#Constant
SAVE_FILES_TO_LOCAL_SYSTEM = True
    
    
def createAndUpload(filePath: str, fileName: str, data: bytes):
    """Abstracts the way we create the data files and upload
    them to Firebase

    Args:
        filePath (str): Sub folder to put the file in
        fileName (_type_): name of the file
        data (_type_): utf8 encoded bytes??
    """
    try:
        if(SAVE_FILES_TO_LOCAL_SYSTEM):
            with open(f"{filePath}/{fileName}", mode="w+b") as file:
                
                file.write(data)
                
                file.seek(0)  # Rewind the file pointer to the beginning
                bucket = storage.bucket()
                blob = bucket.blob(f"MagneticTiles/{filePath}/{fileName}") 
                blob.upload_from_file(file_obj=file, rewind=True)
        else:
            
            with tempfile.NamedTemporaryFile(delete=False) as file:
                file.write(data)
                
                file.seek(0)  # Rewind the file pointer to the beginning
                bucket = storage.bucket()
                blob = bucket.blob(f"MagneticTiles/{filePath}/{fileName}") 
                blob.upload_from_file(file_obj=file, rewind=True)
        
            
    except Exception as e:
        print(f"An error occurred (createAndUpload):({fileName}) -> {str(e)}")






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
    
    # print("WHY", calculateEuclidanPercentChange(shortest_euclid_distances, user_euclid_distances))
    


    #Save Relevent Data to session to be used in scoring page
    session["AverageEuclidanPercentChange"] = math.floor(calculateEuclidanPercentChange(shortest_euclid_distances, user_euclid_distances))
    session["TimeToCompleteLevel"] = time_to_complete
    session["ExpectedTimeToCompleteLevel"] = EXPECTED_TTC[level][sub_level]
    
    print("HOPE", session.get("AverageEuclidanPercentChange"))
    print("HOPE", session.get("TimeToCompleteLevel"))
    
    

    
    
    #======================================    
    #              INFO FILE
    #======================================
        
    info_file_path = "level_info"
    info_file_name = f"Info_{level}-{sub_level}_{userID}.txt"
    os.makedirs("level_info/", exist_ok=True)
    

    # Define the string with indentation
    SCREEN_WIDTH_INDEX = 6
    SCREEN_HEIGHT_INDEX = 7
    info_file_string = f"""
        Screen Size: 
        {data[0][SCREEN_WIDTH_INDEX]}x{data[0][SCREEN_HEIGHT_INDEX]}

        Level: 
        {str(level)}, {str(sub_level)}

        UserID: 
        {str(userID)}

        Time to Complete Level: 
        {time_to_complete['ttc_minutes']}:{time_to_complete['ttc_seconds']}
    """

    # Remove leading spaces from each line in the string
    info_file_string = '\n'.join(line.lstrip() for line in info_file_string.splitlines())
    info_file_data = info_file_string.encode("utf-8")
    
    #Info File
    createAndUpload(info_file_path, info_file_name, info_file_data)
    
    

    
    

    
    #======================================    
    #              EUCLID FILES
    #======================================
    os.makedirs("euclid/", exist_ok=True)
    euclid_path = "euclid"
    shortest_euclid_file_name = f"Shortest_{level}-{sub_level}_{userID}.json"
    user_euclid_file_name = f"User_{level}-{sub_level}_{userID}.json"
    

    #Shortest Distances JSON
    shortest_euclid_data = json.dumps(shortest_euclid_distances).encode("utf-8")
    createAndUpload(euclid_path, shortest_euclid_file_name, shortest_euclid_data)
       
        
    #User Distances JSON
    user_euclid_data = json.dumps(user_euclid_distances).encode("utf-8")
    createAndUpload(euclid_path, user_euclid_file_name, user_euclid_data)
    
    
    
    
    
    
    
    #======================================    
    #              MOUSE FILE
    #======================================
    mouse_data_path = "mouse_data"
    mouse_data_file_name = f"Mouse_{level}-{sub_level}_{userID}.csv"
    
    # Create the header row
    header_row = ['x', 'y', 'timestamp', 'shape', 'x(px/s^2)', 'y(px/s^2)', 'screenWidth', 'screenHeight']
    csv_data = [header_row] + data

    # Convert the accumulated data to a CSV string
    csv_data = '\n'.join([','.join(map(str, row)) for row in csv_data])
    csv_data = csv_data.encode('utf-8')
    
    #Upload Mouse Data
    createAndUpload(mouse_data_path, mouse_data_file_name, csv_data)
    
    
    # Create a named temporary file in memory
    # with tempfile.NamedTemporaryFile(prefix=temp_file_prefix, mode="w+b", delete=False, suffix=".csv", dir=TEMP_FILE_DIRECTORY) as temp_file:
    

        
        
    response = {'message': 'Data received and processed successfully'}
    return jsonify(response)


@app.route('/process-nogo-data', methods=['POST'])
def processnogo():
    
    #Retrive Data from Post request
    res = request.get_json()
    data = res["data"]
    userID = res["userID"] #Used to differentiate csv files from differet subjects
    
    print(data)
    
    # Create a StringIO object to write the CSV data into a string
    output = io.StringIO()

    # Create a CSV writer
    writer = csv.DictWriter(output, fieldnames=data[0].keys())

    # Write header and rows
    writer.writeheader()
    for row in data:
        writer.writerow(row)

    # Get the CSV string from the StringIO object
    csv_string = output.getvalue()

    
    #======================================    
    #              NOGO FILES
    #======================================
    os.makedirs("nogo/", exist_ok=True)
    nogo_path = "nogo"
    nogo_file_name = f"nogo_{userID}.csv"
    

    #Shortest Distances JSON
    nogo_data = csv_string.encode("utf-8")
    createAndUpload(nogo_path, nogo_file_name, nogo_data)
    
    response = {'message': 'Data received and processed successfully'}
    return jsonify(response)
    
    

# if __name__ == '__main__':
#     mqtt_client.loop_start()
#     socketio.run(app, debug=True)
