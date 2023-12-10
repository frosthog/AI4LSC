from sklearn.impute import KNNImputer
import pandas as pd

# Load data
soil = pd.read_csv('soil-merged.csv')
X = soil.drop(['SURVEY_DATE', 'LC1', 'LU1', 'NUTS_0', 'NUTS_1', 'NUTS_2', 'NUTS_3', 'Depth'], axis=1)
X_cols = X.columns.values

# Impute data
imputer = KNNImputer()
X = imputer.fit_transform(X)
X = pd.DataFrame(X, columns=X_cols)

# Round values
X.loc[:, 'MAIN_CLIMA'] = X['MAIN_CLIMA'].round()
X.loc[:, 'SURVEY_MONTH'] = X['SURVEY_MONTH'].round()
X.loc[:, 'Elevation'] = X['Elevation'].round()
X.loc[:, 'slope (Degrees)'] = X['slope (Degrees)'].round()

# Save csv
X.to_csv('soil_imputed_data.csv', index=False)
