import pandas as pd
import matplotlib.pyplot as plt
# Read the data from the CSV file

data = pd.read_csv("/Users/shehjarsadhu/Downloads/MouseDataAnalysis.csv")


# data = pd.read_csv('/mnt/data/MouseDataAnalysis.csv')

# List of unique levels
levels = data['Level'].unique()

# Set up a subplot for each level
fig, axes = plt.subplots(nrows=len(levels), ncols=1, figsize=(14, 6 * len(levels)))

# Iterate over each level and plot the trends
for ax, level in zip(axes, levels):
    # Filter data for the current level
    level_data = data[data['Level'] == level]
    
    # Group by Shape and PID for the current level and calculate the average percentage change
    average_percentage_change_level = level_data.groupby(['Shape', 'PID'])['Percentage Change'].mean().reset_index()
    
    # Pivot the data for better visualization
    pivot_table_level = average_percentage_change_level.pivot(index='PID', columns='Shape', values='Percentage Change')
    
    # Plot data for each participant for the current level with thicker lines
    for participant in pivot_table_level.index:
        ax.plot(pivot_table_level.columns, pivot_table_level.loc[participant], label=participant, marker='o', linewidth=4)
    
    # Set title, labels, and legend (outside of the plot) for the current subplot
    ax.set_title(f'Trend of Percentage Change for {level}')
    ax.set_xlabel('Shape')
    ax.set_ylabel('Average Percentage Change (%)')
    ax.legend(loc='center left', bbox_to_anchor=(1, 0.5))
    ax.grid(True, which='both', linestyle='--', linewidth=0.5)
    ax.set_xticks(pivot_table_level.columns)
    ax.set_xticklabels(pivot_table_level.columns, rotation=45)

plt.tight_layout()
plt.subplots_adjust(right=0.75)
plt.show()