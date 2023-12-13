# AI4LSC

![image](VisualData/visu-demo.PNG)

## Introduction

This readme serves as documentation for the project submission.
You can access the visualization system on [here](http://152.228.142.81:4545/) or use http-server to run it locally.

## Concept

The main idea was to provide an approach for exploration of soil data to gain new insight of correlation with the use of modern technologies. For this a data analysis was conducted with machine learning and a 3d visualtion tool that can be used from any modern browser. These two components are described in the following sections.

## Data Analysis

### Data source

The data source was the [LUCAS data](data/raw_data) from the years 2009, 2015, 2018 provided by the challangers. The microbiome sequencing data was not used due to time constraint.

### Data cleaning

The data had to be cleaned first to make it uniform between the three years. The following steps were done:

* The columns in the csv had different naming that needed to be understood and related to the other csv files with the information provided in the LUCAS reports.
* Duplicate or columns with lots of missing data were excluded.
* All values which where out of LOD were considered null as it was not clear to us if the data was really out of LOD or missing.

The process written in [LUCAS_Soil_Data_Overview.ipynb](data/LUCAS_Soil_Data_Overview.ipynb) does this and creates and output file [soil-merged.csv](data/soil-merged.csv) that is a uniform table of all three years combined.

![image](data/soil-merged-missing-data.png)
*Figure 1: Overview of missing data represented as a black line*

The correlation matrix shows linear correlation between each feature. The following observations were made:

* pH H20 and pH CaCl2 had a correlation of 0.99 which means they have almost perfekt linear correlation. Therefore pH CaCl2 was taken out as a feature as it does not provide any new information.
* N and OC have a linear correlation of 0.91
* LAT(itude) and pH H20 have a linear correlation of 0.62

For a prediction feature we choose **CaCO3** as it has some missing data as shown in Figure 1 and has some correlations with different other features.

![image](data/soil-merged-correlation-matrix.png)
*Figure 2: Correlation matrix of the existing features higher than 0.2*

### Feature Engineering

To predict CaCO3 further steps where taken to possibly improve a prediction model. For this additional features where generated. In this step the previously generated [soil-merged.csv](data/soil-merged.csv) was used by the [feature_engineering.py](data/feature_engineering.py) script to generate additional columns that can be used as input for ML model.

The idea was to also include the CaCO3 values of neighboring LUCAS points to improve prediction the CaCO3 of a LUCAS point. The assumption was that the soil is mostly continous and not changing apruptly. The first step was to use a nearest neighbor algorithm based on longitude and latitude to find the nearest neighbors for each point. Figure 3, 4 and 5 show the connections of each point as a check if the implentation works as intended. It is not perfect as some connections are made between coasts of different islands. After that the POINT_ID where identified CaCO3 values where read and put as additional columns for each LUCAS points. The 4 nearest LUCAS points were chosen. The script produces the [ml_soil.csv](data/ml_soil.csv) that was used as a base for the machine learning model.

![image](data/nn_graph_2009.png)
*Figure 3: Nearest neighbor for 2009 LUCAS points*

![image](data/nn_graph_2015.png)
*Figure 4: Nearest neighbor for 2015 LUCAS points*

![image](data/nn_graph_2018.png)
*Figure 5: Nearest neighbor for 2018 LUCAS points*

### Machine learning

#### Training and evaluation

The previously generated [ml_soil.csv](data/ml_soil.csv) was used as a base dataset for machine learning. The script [ml_prediction_CaCO3.ipynb](data/ml_prediction_CaCO3.ipynb) was used to train, evaluate and investigate a machine learning model to predict the CaCO3 values. For this the existing dataset was split into a train and test set. The test set was used to evaluate the models performance with an R2-Score.

Different approaches were investigated resulting in R2-score around 0.70 for different features. Figure 6 shows the model weights the nearest LUCAS point most followed by the pH H20 value. An analysis of the error *abs(prediction - true value)* in Figure 7 shows an indication of increasing error with increasing CaCO3 values. This is further supported by Figure 8 showing a linear correlation between error and true value of 0.59. This concludes that the model has problems correctly predicting higher CaCO3 values. One explanation is the distribution that there are many more low CaCO3 values than high as shown in Figure 9.

![image](data/ml-feature-importance.png)
*Figure 6: Graph showing feature importance of the model.*

![image](data/ml-error.png)
*Figure 7: True value (CaCO3_og), predicted value (CaCO3_pred) and the error (CaCO3_error) ordered by ascending error*

![image](data/ml-error-correlation-matrix.png)
*Figure 8: Correlation matrix between True value (CaCO3_og), predicted value (CaCO3_pred) and the error (CaCO3_error)*

![image](data/ml-CaCO3-hist.png)
*Figure 9: Histogramm of CaCO3*

#### Model investigation

The exploration of a machine learning model could provide new insight on correlation of data and their features. <https://shap.readthedocs.io/en/latest/index.html> was used on the trained model to investigate the behaviour the full analysis is done in [ml_prediction_CaCO3.ipynb](data/ml_prediction_CaCO3.ipynb) at the end. Figure 10 shows an overview of the general impact of each feature with high or low value. E.g. Data with low K has pushed prediction for CaCO3 up in general, while high K pushed prediction in general down. Figure 11 shows the influence of pH H2O to the CaCO3 prediction. Interstingly it has a negative effect up to pH H2O of 7 and then prediction influence changes to positive effect in linear. Figure 12 shows an intresting behaviour where low K and high K have an opposite effect with increasing pH H2O values.

![image](data/ml-investigation-1.png)
*Figure 10: The x-axis shows if the feature impacts the model prediction of higher or lower, Blue means low feature value and red high feature value, the thickness represents the distribution of feature points.*

![image](data/ml-investigation-2.png)
*Figure 11: The predidiction is pushed down up to a pH H2O of 7. From 7 and above the influence of prediction increases linear.*

![image](data/ml-investigation-3.png)
*Figure 12: With high K (red) and increasing pH H2O the prediction effect increases in negative direction. While with low K (blue) and increasing pH H2O the effect increases in the positive direction.*

# DATA CLEANING - PRE-VISUALIZATION

### Data source

The visualization uses imputed data of the [soil-merged.csv](data/soil-merged.csv). This was created by basic KNN imputation [soil_imputation_knn.py](data/soil_imputation_knn.py) to use as a base for visualization.

## Obsolete - Used when we started - CSV Merger C++ -- [code](./csv_merger_source)


This program is designed to merge data from multiple CSV files into a single file, focusing specifically on columns that are common across all the files. It does this by first reading the headers (the first line in each file, which contains the column names) from three different CSV files.

After identifying the common columns in these files, the program creates a new CSV file where it compiles the data.
This new file starts with a 'Year' column, followed by the data from the common columns for each year. It goes through each of the original files, line by line, extracting and writing the relevant data to this new file.


## Obsolete - Used when we started - CSV NORMALIZER C++ -- [code](./csv_float_normalizer_source)

This program is designed to normalize the data in a CSV file, merged_data.csv, and output the results into a new file, normalized_data.csv.
The normalization process adjusts the values in the dataset so that they are on a common scale, typically to make the data more suitable for analysis or further processing.

The program starts by reading the header line from the input file and writes it unchanged to the output file. It then proceeds to read the rest of the data, line by line. During this process, it performs two main tasks:

* Data Collection and Min-Max Identification:

It splits each line into individual data points then checks if the data can be converted to a float and updates the minimum and maximum values found for each column. These min-max values are used later in the normalization process.

* Normalization and Output:

The program iterates over the collected data, for each value if it's a valid float, it normalizes the value. The normalization formula used is (value - minValue) / (maxValue - minValue), which scales the value between 0 and 1.


## CSV NORMALIZER JS -- [code](./predictions/csvNorm)

This program normalizes and filters data from a CSV file, soil_imputed_data.csv, and then creates a new CSV file, normalized_clean.csv, with the processed data. It uses the Papa Parse lib to parse the CSV file. The program's functionalities are data normalization, filtering based on the wanted criteria, and exporting the processed data to a new CSV file.

* Normalization Function :

It takes a value and its respective minimum and maximum values, normalizes it to a scale between 0 and 1, and returns the normalized value rounded to five decimal places.

* Data Processing :

The program identifies specific columns in the dataset to be normalized, such as 'Coarse', 'Clay', 'Silt', then groups the data by POINT_ID, ensuring that each group represents data from the same point.
The data is filtered to include only those points that have data for the required years (2009, 2015, 2018). Points not meeting this criterion are logged and excluded.
For each column designated for normalization, it calculates the minimum and maximum values across the filtered dataset. The data is then mapped, converting each row into a format where the specified columns are normalized using the normalize function


## ML_PRED JS -- [code](./predictions/ML_pred)

This JavaScript program was initially intended to use machine learning techniques to predict soil data for several years into the future, using a dataset spanning only three years (2009, 2015, and 2018). The goal was to forecast values for various soil properties like Coarse, Clay, Silt, Sand, pH, etc., based on existing patterns. However, due to the limited scope of the data, the machine learning approach proved inadequate for making accurate predictions.

### Intended Machine Learning Approaches:

* Linear Regression:
This method could have been used to predict future values by assuming a linear relationship between the year and each soil property. However, linear models are too simplistic for capturing complex environmental data patterns.

* Polynomial Regression:
A more complex model that could have been used to fit a non-linear relationship between the year and soil properties. This might have been more suitable for environmental data which often has non-linear characteristics but the tests didn't give any accurate results.

* Time Series Analysis: Techniques like ARIMA (AutoRegressive Integrated Moving Average) could have been appropriate for forecasting based on time series data. These models are adept at capturing trends, seasonality, and other temporal dynamics in data but it has not been tested yet.

* The Challenge and Alternative Approach:
The main challenge was the inadequacy of data. Machine learning models generally require large datasets to learn patterns accurately. With only three data points per feature, the models likely struggled to identify reliable patterns, leading to poor predictive performance.

As a workaround, the program resorts to a randomized approach for generating data for the missing years.

### Random Value Generation:

For each feature, it calculates the minimum and maximum values observed across the three years.
For years without data (from 2009 to 2050), it generates random values within these min-max ranges for each feature, ensuring that the values stay within a plausible range.

It processes the data by grouping it by POINT_ID, maintaining geographic consistency. For each missing year in a point ID, it generates a new data row with randomized values for each feature. The data is then formatted, sorted by year, and combined into a single dataset.

While the initial plan was to use sophisticated machine learning methods to predict soil data over several years, the lack of sufficient historical data led to the adoption of a more straightforward randomization approach within coherent value ranges. This method ensured the generation of a comprehensive dataset (without the predictive accuracy that machine learning could have provided) to feed the visualization system.


## VISUALIZATION JS/THREEJS -- [code](./VisualData)

The system is an interactive 3D visualization tool that displays geographical data points on a virtual globe. Each point represents specific data collected from various locations across the globe.

### Features:

* Color-Coded Data Points:
Each point on the globe is color-coded to represent different data values. The color intensity changes based on the data's magnitude, providing a quick visual understanding of the data's nature.

* Single Feature Mode:
Visualizes data for a single selected feature across all points. Each point’s color represents the normalized value of this feature.

* Feature Comparison Mode:
Compares two selected features. The color difference between points illustrates the comparative values of these features.

* Feature Aggregation Mode:
Shows an average of multiple selected features. This mode aggregates data from multiple features and displays an averaged value.

* Interactive Year Selection:
Users can choose a specific year to view data from that year, allowing for a temporal analysis of changes and trends over time.

* Interactive Globe:
The virtual globe can be rotated and zoomed, enabling users to focus on specific geographic regions or get a global overview.

* Point Selection:
Clicking on a point displays detailed data about that location, enhancing the tool's interactivity and providing in-depth information.

### Tech:

* 3D Rendering with THREE.js:
The globe is rendered using THREE.js, a WebGL library.
Data points are represented as instanced meshes objects which optimizes the render to keep the perfomances high.

* Data Handling and Parsing:
The system parses CSV data using a custom parseCSV function. This function extracts and processes data for each year and mode.
Data is dynamically loaded and visualized based on the selected year and mode.

* Raycasting for Interactivity:
The system uses THREE.js raycasting to detect mouse interactions with the 3D objects (data points).
Clicking on a point triggers a function that displays detailed data for that point.

* Mode-Specific Logic:
Each mode has a unique way of processing and visualizing data.
The color of each point is determined based on the current mode and the data associated with that point.

* Responsive Design:
The visualization adjusts to different screen sizes and window resizing, ensuring a consistent user experience across devices.

This system is a sophisticated yet user-friendly tool that leverages 3D visualization to present geographical data in an interactive and informative manner. Its versatility in displaying different data types and temporal data makes it an interesting tool for data analysis and geographic information systems.

## Conclusion and possible next steps

The models performance with an R2-score of 0.70 for CaCO3 prediction needs to be improved. LUCAS data of additional years and further investigation is needed to improve it. Also the possibity to predict other features like P or N can be investigated and what kind of data is necessary to do it. Maybe other data such as microbiome or meteorolical data is needed to predict such values accurately. The model exploration method can get new insight on model behaviour, that is espacially interesting with better performing models. This can be used as an explorative way to understand the model better and maybe even see new correlation or patterns. While this only shows correlation this could be used to start research investigating causality.

None of the team members where experts in soil, so some assumptions that were done in the project might not be ideal. The assumption that soil changes continously may be correct for untouched soil, but not for farming land. There is probably a strong break between a LUCAS point in a natural reserve and a neighboring point that is on farmland. For this the feature engineering needs to be improved to somehow consider this. Maybe considering the land use of the neighboring LUCAS and own LUCAS point a model could create some kind of simalarity matrix.

Figure 2 shows a linear correlation of 0.24 between survey month and pH H2O. While this is low it opens the question how soil changes during the year. Here it would also be interesting how microbiome changes and soil properties that can be measured in the lab. And if this can be put in a model for prediction.

## Appendix

### Categorical LUCAS Properties

#### Climate zones

1 Boreal and boreal to temperate
2 Atlantic
3 Sub-oceanic
4 Sub-oceanic to sub-continental
5 Subcontinental, partly arid
6 Temperate mountainous
7 Mediterranean semi-arid
8 Mediterranean temperate and sub-oceanic
9 Mediterranean mountainous


#### Land Cover - LC

A Artificial land
B Cropland
C Forest
D Scrubland
E Grassland
F Bareland
G Water
H Wetlands

<https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:Land_cover>

##### Cropland
**Cereals**
B11 Common wheat
B12 Durum wheat
B13 Barley
B14 Rye
B15 Oats
B16 Maize
B17 Rice
B18 Triticale
B19 Other cereals

**Root crops**
B21 Potatoes
B22 Sugar beet
B23 Other root crops

**Non-permanent industrial crops**
B31 Sunflower
B32 Rape and turnip rape
B33 Soya
B34 Cotton
B35 Other fibre and oleaginous crops
B36 Tobacco

**Dry pulses, vegetables and flowers**
B41 Dry pulses
B42 Tomatoes
B43 Other fresh vegetables
B45 Strawberries

**Fodder crops**
B51 Clovers
B52 Lucerne
B53 Other Leguminous and mixtures for fodder
B54 Mix of cereals
B55 Temporary grassland

**Permanent crops**
B71 Apple fruit
B72 Pear fruit
B73 Cherry fruit
B74 Nuts trees
B75 Other fruit trees and berries
B76 Oranges
B77 Other citrus fruit and other permanent crops 
B81 Olive groves
B82 Vineyards
B83 Nurseries
B84 Permanent industrial crops

##### Woodlands
C10 Broadleaved and evergreen woodland
C20 Coniferous woodland
C30 Mixed woodland

##### Scrubland
D10 Shrubland with sparse tree cover
D20 Shrubland without tree cover

##### Graslands
E10 pastures under sparse tree or shrub cover,
E20 grassland without tree/shrub cover
E30 spontaneously re-vegetated surfaces

##### Wetlands
H11 inland marshes
H12 peat bogs

#### Land use - LU
U110 	Agriculture
U120 	Forestry
U130 	Fishing
U140 	Mining and quarrying
U150 	Hunting
U210 	Energy production
U220 	Industry and manufacturing
U310 	Transport, communication networks, storage and protective works
U320 	Water and waste treatment
U330 	Construction
U340 	Commerce, finance and business
U350 	Community services
U360 	Recreational, leisure and sport
U370 	Residential
U400 	Unused 

<https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:Land_use>

#### NUTS Code

<https://ec.europa.eu/eurostat/web/nuts/nuts-maps>
