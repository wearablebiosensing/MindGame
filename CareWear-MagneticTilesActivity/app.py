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
from functools import partial  # Import functools.partial
import threading
csv_lock = threading.Lock()


#####################
# CORE_MQTT.py
#####################
# running = True #0= not collecting.
sample_count = 0

MAX_SAMPLES = 10
# Create an MQTT client
client = mqtt.Client()


# filename = "./mqtt_data.csv"

# Define callback functions for MQTT events
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker")
        client.subscribe("M5StackcPlus/hello")  # Subscribe to the MQTT topic you're interested in
        client.subscribe("AndroidWatch/acceleration")  # Subscribe to the MQTT topic you're interested in

    else:
        print(f"Failed to connect, return code: {rc}")
accelerometer_data_list = []
def on_message(client, userdata, message):
    # print("level,sub_level,userID: ",level,sub_level,userID)
    print("client: ",client)
    print("userdata: ",userdata)
    print("message: ",message)
    #print(f"Received message '{message.payload.decode()}' on topic '{message.topic}'")
    if message.topic == "AndroidWatch/acceleration":
        # print("level,sub_level,userID: ",level,sub_level,userID)
        acc_data_msg = message.payload.decode()
        print("message.topic: ",acc_data_msg)
        save_to_csv(acc_data_msg)
        # if sample_count >= :
            # print("Stoop Data Collection")
            # stop_data_collection()
       # accelerometer_data_list.append(acc_data_msg)
       # print("accelerometer_data_list: ",len(accelerometer_data_list),accelerometer_data_list)

def on_disconnect(client, userdata, rc):
    if rc != 0:
        print(f"Unexpected disconnection, return code: {rc}")

def save_to_csv(data,header=None):
    global filename  # Reference the global filename variable
    print("save_to_csv: ",filename)
    file_exists = os.path.exists("./watch_data/" +filename + ".csv")

    print("data saving....", data)
    # Open the file in append mode with a+ which creates the file if it doesn't exist
    with open(filename+ ".csv", "a", newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        # If the file didn't exist and header is provided, write the header
        if not file_exists and header is not None:
            csv_writer.writerow(header)
        # Write the data row
        csv_writer.writerow([data])

def stop_data_collection():
    # Disconnect the MQTT client
    client.disconnect()
    client.loop_stop()  # Stop the MQTT client loop

def start_data_collection(level,sub_level,userID):
#   level,sub_level,userID
    # Set the callback functions
    client.on_connect = on_connect
   # on_message_callback = partial(on_message_custom, level,sub_level,userID)
    client.on_message = on_message

    # client.on_message = on_message
    client.on_disconnect = on_disconnect

    # Connect to the MQTT broker
    client.connect("test.mosquitto.org", 1883)  # Replace with your MQTT broker's address and port
    # Start the MQTT client loop (this is a non-blocking call)
    client.loop_forever()
#####################
# CORE_MQTT.py STOP
#####################



app = Flask(__name__)
socketio = SocketIO(app)
app.secret_key = "super secret key"



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




#================= Helper Functions =============================

### 
@app.route("/start_mqtt",methods=['GET','POST'])
def start_mqtt_collection():
    global filename
    #Retrive Data from Post request
    res = request.get_json()
    level = res["level"] #Current level that posted data is from
    sub_level = res["sub_level"]
    userID = res["userID"] #Used to differentiate csv files from differet subjects
    filename = str(level) + "_" + str(sub_level)+ "_" + str(userID)
    print("start_mqtt_collection(): /",filename)
    start_data_collection(level,sub_level,userID)
    return "",201
@app.route("/stop_mqtt",methods=['GET','POST'])
def stop_mqtt_collection():
    stop_data_collection()
    return "",201



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
