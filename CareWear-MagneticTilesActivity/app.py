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
# pip3 install -r flask firebase-admin pandas scipy numpy matplotlib
import threading
csv_lock = threading.Lock()

app = Flask(__name__)
app.secret_key = "super secret key"

root = "/Users/shehjarsadhu/Desktop/UniversityOfRhodeIsland/Graduate/WBL/Project_Carehub/CareWear-PortalView/CareWear-MagneticTilesActivity/"

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
socketio = SocketIO(app)
# Subscribe to multiple topics
# topics = [("M5StackcPlus/acceleration", 0), ("M5StackcPlus/hello", 0)]  # Replace with your desired topics and QoS level

# MQTT callback functions
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker")
    # for topic, qos in topics:
    client.subscribe("M5StackcPlus/acceleration",0)  # Subscribe to the MQTT topic

def on_message(client, userdata, message):
    topic = message.topic
    payload = message.payload.decode("utf-8")
    print(f"Received message on topic '{topic}': {payload}")
    # if topic.split("/") == "hello":
    #     data = message.payload.decode()
    #     print(f"Received message Hello Topic: {topic}")
    #     print(f"Received message: {data}")
    #     socketio.emit('mqtt_message2', {'data': data})
    data = message.payload.decode()
    print(f"Received message acceleration: {topic}")
    print(f"Received message: {data}")
    socketio.emit('mqtt_message', {'data': data})



mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect("test.mosquitto.org", 1883)

@app.route('/mqtt_connect_page')
def mqtt_connect():
    return render_template('mqtt_template.html')

@socketio.on('connect')
def handle_connect():
    print('WebSocket connected')

## For each individual file within the Watch folder Eg: 638116435299306610_30hz.csv
## Quality check for each file get the parameters and write to a results file.
# per_watch - is a list of CSV files in a folder.
def local_file_read(per_watch,root):
    df_acc_list = []
    for file in per_watch: # Get the CSV files for the given watch ID.
        if re.search('acc', file):
            print("All Acc files: ",file)
            df_acc = pd.read_csv(root + "/"+file)
            df_acc_list.append(df_acc)
    df_20 = pd.concat(df_acc_list)
    print(df_20.head())
    print("Start and End Timestamp: ",df_20.iloc[0]["DateTime"],df_20.iloc[df_20.shape[0]-1]["DateTime"])
    # Convert the Timestamp column to datetime objects
    df_20['Timestamp'] = pd.to_datetime(df_20['DateTime'], format='%H:%M:%S:%f')
    # Sort the DataFrame by the Timestamp column
    df_20_sorted = df_20.sort_values('Timestamp')
    print("Sorted Start and End Timestamp: ",df_20_sorted.iloc[0]["DateTime"],df_20_sorted.iloc[df_20_sorted.shape[0]-1]["DateTime"])
    print("New sorted df",df_20_sorted.columns)
    accel_data_x = np.array(df_20_sorted[' x'])
    accel_data_y = np.array(df_20_sorted['y'])
    accel_data_z = np.array(df_20_sorted['z'])
    zcr_x = calculate_zero_crossing_rate(accel_data_x)
    zcr_y = calculate_zero_crossing_rate(accel_data_y)
    zcr_z = calculate_zero_crossing_rate(accel_data_z)
    print("ZCR X:", zcr_x)
    print("ZCR Y:", zcr_y)
    print("ZCR Z:", zcr_z)
    
# Takes in a numpy array of values from the accelerometer data
def calculate_zero_crossing_rate(accel_data):
    accel_data = (accel_data - np.mean(accel_data)) / np.std(accel_data)
        # Calculate Zerocrossing rate.
    zero_crossings = np.nonzero(np.diff(np.signbit(accel_data)))[0]
    zcr = len(zero_crossings) / (2.0 * len(accel_data))
    return zcr

# Read data form cloud. 
def read_csv_from_firebase():
    bucket = storage.bucket()
    blobs = bucket.list_blobs()
    print("blobs: ",blobs)
    main_list = []
    acc_df_list = []
    for blob in blobs:
        if blob.name.endswith('.csv') and blob.name.split("/")[0]=="fff6be8bb6243e97" and blob.name.split("/")[1]=="11-07-2023":  
            print("blob.name.split: ",blob.name.split("/"))
            main_list.append(blob.name.split("/"))
        if blob.name.endswith('.csv') and 'acc' in blob.name and blob.name.split("/")[0]=="fff6be8bb6243e97" and blob.name.split("/")[1]=="11-07-2023":
              print("blob.name. ACC data === ",blob.name)
              csv_data = blob.download_as_text()
              df_acc = pd.read_csv(io.StringIO(csv_data))
              acc_df_list.append(df_acc)
    acc_df = pd.concat(acc_df_list, ignore_index=True)
    # Convert the Timestamp column to datetime objects
    acc_df['Timestamp'] = pd.to_datetime(acc_df['DateTime'], format='%H:%M:%S:%f')
    # Sort the DataFrame by the Timestamp column
    acc_df_sorted = acc_df.sort_values('Timestamp')
    print("Sorted Start and End Timestamp: ",acc_df_sorted.iloc[0]["DateTime"],acc_df_sorted.iloc[acc_df_sorted.shape[0]-1]["DateTime"])
    print("New sorted df",acc_df_sorted.columns)  
    print(acc_df.columns,acc_df.shape)
    # This is a list of all files in the folder. 
    files_list_df = pd.DataFrame(main_list,columns=["deviceID","date","file_name"])
    return files_list_df

def count_files(files_list_df):
    file_count_json = {}
    for i in files_list_df["deviceID"].unique():
        if i == "fff6be8bb6243e97":
          # first subset the pandas df by unique device ID.
          files_list_df_device = files_list_df[files_list_df["deviceID"]==i] 
          # then subet by files: scc,gry,hr, and battery changed.
          files_list_df_acc = files_list_df_device[files_list_df_device["file_name"].str.contains('acc')]
          files_list_df_gry = files_list_df_device[files_list_df_device["file_name"].str.contains('gry')]
          files_list_df_hr = files_list_df_device[files_list_df_device["file_name"].str.contains('hr')]
          files_list_df_battery = files_list_df_device[files_list_df_device["file_name"].str.contains('on')]
          # print("files_list_df_acc:::: ",files_list_df_acc)
          # for acc_file in files_list_df_acc:
          #     csv_data = acc_file.download_as_text()
          #     df_acc = pd.read_csv(io.StringIO(csv_data))
          #     acc_df_list.append(df_acc)
          len_acc_files = files_list_df_acc.shape
          len_gry_files = files_list_df_gry.shape
          len_hr_files =files_list_df_hr.shape
          len_battery_files = files_list_df_battery.shape
          print("FILE ACC INFO ",i,len_acc_files[0])
          file_count_json[i] =[len_acc_files[0],len_gry_files[0],len_hr_files[0],len_battery_files[0]]
    return file_count_json


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


# ----------- Routes for the scoring Page -----------------

#Shows renders the scoring page with some parameters
@app.route('/scoring_page', methods=['GET','POST'])
def scoring_page():
    userID = request.args.get('userID')
    level = int(request.args.get('level'))
    return render_template("scoring_module.html", userID=userID, level=level)


#The scoring page calls to this route when loading to get the graph based on input
@app.route('/mouse_movement_graph/<userID>/<level>')
def scoring_graph(userID, level):
    csv_file = f"mouse_data/Level_{level} - user{userID}.csv"  # Adjust the file naming pattern as needed
    with csv_lock:
        image_data = "Gone" #plot_mouse_movement(csv_file)
    # return Response(image_data, mimetype='image/png')
    return image_data
    


@app.route('/acceleration_graph/<userID>/<level>')
def acceleration_graph(userID, level):
    csv_file = f"mouse_data/Level_{level} - user{userID}.csv"  # Adjust the file naming pattern as needed
    with csv_lock:
        image_data = "Gone"  #plot_acceleration_data(csv_file)
    # return Response(image_data, mimetype='image/png')
    return image_data


# Route to return completion time
@app.route('/completion_time/<userID>/<level>')
def completion_time(userID, level):
    csv_file = f"mouse_data/Level_{level} - user{userID}.csv"  # Adjust the file naming pattern as needed

    level_completion_time = 1 #calculate_completion_time(csv_file)
    return level_completion_time

#================= Helper Functions =============================




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
            "seconds" : 10,
        },
        
        2: {
            "minutes": 0,
            "seconds" : 20,
        },
        3: {
            "minutes": 0,
            "seconds" : 15,
        },
    },
    
    
    #Level 2
    2:{
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
            "seconds" : 15,
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
            "seconds" : 15,
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



if __name__ == '__main__':
    mqtt_client.loop_start()
    socketio.run(app, debug=True)
