import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import LabelEncoder
from sklearn.neighbors import NearestNeighbors

################################################################
# This script adds features to the soil data set.
# It adds the 4 nearest geographic points based on LONG, LAT
# and it adds for each point: CaCO3, LONG, LAT, DIST
################################################################

def get_nearest_points(soil, survey_year, y_label):
    '''
    Returns data frame with nearest points of the same with same year.
    '''
    this_soil = soil[soil['SURVEY_YEAR'] == survey_year]
    eval_df = this_soil.dropna()
    
    # Encode categorical to integer number labels
    le = LabelEncoder()
    eval_df.loc[:, 'LC1'] = le.fit_transform(eval_df['LC1'])
    eval_df.loc[:, 'LU1'] = le.fit_transform(eval_df['LU1'])

    nn_df = this_soil[['POINT_ID', 'LONG', 'LAT', y_label]].dropna()
    nn_points_df = nn_df[['POINT_ID', 'LONG', 'LAT']].groupby('POINT_ID').mean().reset_index()
    xy = nn_points_df[['LONG', 'LAT']]

    # Get n - 1 neighbors
    N_NEIGHBORS = 5

    knn = NearestNeighbors(n_neighbors=N_NEIGHBORS)
    knn.fit(xy)
    distance_mat, neighbours_mat = knn.kneighbors(xy)

    nn = []
    nn_distance = []

    for i, neighbors in enumerate(neighbours_mat):
        nn_points = []
        nn_points_distance = []
        for j in range(1, N_NEIGHBORS): # Exclude first element because it is always itself
            neighbor_index = neighbors[j]
            nn_points.append(str(np.int64(nn_points_df.loc[neighbor_index]['POINT_ID'])))
            nn_points_distance.append(str(distance_mat[i][j]))
        nn.append(','.join(nn_points))
        nn_distance.append(','.join(nn_points_distance))

    result = nn_points_df.join(pd.Series(nn, name='NN'))
    result = result.join(pd.Series(nn_distance, name='NN_DIST'))

    # ['POINT_ID_1', 'POINT_ID_2', 'POINT_ID_3']
    point_id_columns = [f'POINT_ID_{i}' for i in range(1, N_NEIGHBORS)]
    point_distance_columns = [f'DIST_{i}' for i in range(1, N_NEIGHBORS)]

    result[point_id_columns] = result['NN'].str.split(',', expand=True).astype('int64')
    result[point_distance_columns] = result['NN_DIST'].str.split(',', expand=True).astype('float64')

    point_to_X_df = nn_df.groupby('POINT_ID').mean()

    for col in point_id_columns:
        result = result.join(point_to_X_df, on=col, rsuffix=col[-2:])
    
    # Print figure > comment out to generate visualization
    # plt.figure(figsize=(100, 100))
    # for col in result_columns:
    #     suffix = col[-2:]
    #     points = result.apply(lambda row: ([row['LONG'], row[f'LONG{suffix}']], [row['LAT'], row[f'LAT{suffix}']]), axis=1)
    #     for p in points:
    #         plt.plot(p[0], p[1], 'r-')
    # plt.savefig(f'data/nn_graph_{survey_year}.png')

    result = result.join(eval_df.set_index('POINT_ID').add_suffix('_og'), on='POINT_ID')
    
    return result


# Prepare data
soil_raw = pd.read_csv('data/soil-merged.csv')
soil = soil_raw.drop(['CEC', 'Coarse','Clay','Silt','Sand', 'SURVEY_DATE','NUTS_3','NUTS_1','NUTS_2','slope (Degrees)', 'EC','Depth','MAIN_CLIMA','SURVEY_MONTH'], axis=1)

le = LabelEncoder()
soil.loc[:, 'NUTS_0'] = le.fit_transform(soil['NUTS_0'])
print(le.classes_)

y_label = 'CaCO3'
# y_label = 'P'

ml_soil = pd.concat([
    get_nearest_points(soil, 2009, y_label),
    get_nearest_points(soil, 2015, y_label),
    get_nearest_points(soil, 2018, y_label)
])


ml_soil = ml_soil.dropna().rename(columns={'CaCO3': 'CaCO3_1'})
ml_soil.to_csv('data/ml_soil.csv', index=False) # Save data to be used for ML training