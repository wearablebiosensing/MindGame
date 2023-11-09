import paho.mqtt.client as mqtt
import csv
from functools import partial

# Define a global variable to control the loop and sample count
running = True
sample_count = 0

# Define the maximum number of samples you want to collect
MAX_SAMPLES = 10

# Define a custom callback function that includes the variable you want to pass
def on_message_custom(client, userdata, message, custom_var):
    print("Custom callback function called")  # Debug print
    print(custom_var)
    global sample_count

    topic = message.topic
    payload = message.payload.decode()

    print(f"Received message '{payload}' on topic '{topic}'")
    
    if topic == "M5StackcPlus/acceleration":
        save_to_csv(payload)
        sample_count += 1

        if sample_count >= MAX_SAMPLES:
            stop_data_collection()

def on_disconnect(client, userdata, rc):
    if rc != 0:
        print(f"Unexpected disconnection, return code: {rc}")

def save_to_csv(data):
    with open("mqtt_data.csv", "a") as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow([data])

def stop_data_collection():
    global running
    running = False

# Create an MQTT client
client = mqtt.Client()

# Set the callback functions using functools.partial to pass custom_var
custom_var = "Your Custom Variable"  # Replace with your custom variable
on_message_callback = partial(on_message_custom, custom_var=custom_var)
client.on_message = on_message_callback

client.on_disconnect = on_disconnect

# Connect to the MQTT broker
client.connect("test.mosquitto.org", 1883)  # Replace with your MQTT broker's address and port

# Start the MQTT client loop (this is a non-blocking call)
client.loop_start()

try:
    while running:
        pass  # Add any other processing or logic you need here
except KeyboardInterrupt:
    print("Interrupted by user")
    running = False  # Set the running flag to False to stop the loop

# Disconnect the MQTT client
client.disconnect()
client.loop_stop()  # Stop the MQTT client loop
