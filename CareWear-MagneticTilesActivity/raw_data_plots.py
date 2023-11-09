import pandas as pd
import matplotlib.pyplot as plt

colors = {'Square': '#7BBEFC', 'Circle': '#EB5757', 'Right Triangle': '#6C63FF', 'Hexagon': '#81E5DB', 'Trapezoid': '#A36DBD', 'Equilateral Triangle': '#FFCC4D', 'Yellow Diamond': '#E5CF81', 'Purple Diamond': '#CA6B6E'}

def plot_stroke(data, shape, screenWidth, screenHeight):
    color = colors.get(shape, 'black')
    
    # Convert 'x' values to numeric
    data['x'] = pd.to_numeric(data['x'])
    
    # Plot with thicker lines
    plt.plot(data['x'], data['y'], color=color, label=shape, linewidth=3)


def main(csv_file):
    df = pd.read_csv(csv_file)
    strokes = []
    current_stroke = []
    unique_shapes = set()  # To keep track of unique shapes

    for _, row in df.iterrows():
        if row['x'] == "END_OF_STROKE":
            if current_stroke:
                strokes.append(current_stroke)
                current_stroke = []
        else:
            current_stroke.append(row)
            unique_shapes.add(row['shape'])  # Add the shape to the unique_shapes set

    if current_stroke:
        strokes.append(current_stroke)

    # Set a larger figure size for the graph (adjust the numbers as needed)
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.invert_yaxis()  # Flip the y-axis

    for stroke in strokes:
        if len(stroke) > 1:
            shape = stroke[-1]['shape']  # Get the shape from the last row of the stroke
            screenWidth = stroke[-1]['screenWidth']
            screenHeight = stroke[-1]['screenHeight']
            plot_stroke(pd.DataFrame(stroke), shape, screenWidth, screenHeight)

    plt.xlabel('X Position')
    plt.ylabel('Y Position')
    plt.title('Mouse Movement Strokes')

    # Generate a single legend entry for each unique shape and place it outside of the plot
    handles, labels = ax.get_legend_handles_labels()
    by_label = dict(zip(labels, handles))
    unique_legend = [by_label[shape] for shape in unique_shapes]
    plt.legend(handles=unique_legend, labels=unique_shapes, loc='center left', bbox_to_anchor=(1, 0.5))

    screenWidth = strokes[-1][-1]['screenWidth']  # Get the screenWidth from the last stroke
    screenHeight = strokes[-1][-1]['screenHeight']  # Get the screenWidth from the last stroke
    
    plt.xticks([val for val in range(0, screenWidth + 1, int(screenWidth / 20))],
               [str(val) for val in range(0, screenWidth + 1, int(screenWidth / 20))], rotation=90)
    plt.grid()  # Add grid lines for better visualization

    plt.show()

main("/Users/shehjarsadhu/Downloads/Data/Level_1_usertest_3.csv")
