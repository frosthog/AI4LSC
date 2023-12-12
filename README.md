# AI4LSC

## Introduction

This readme serves as documentation for the project submission.

## Concept

The main idea was to provide an approach for exploration of soil data to gain new insight of correlation with the use of modern technologies. For this a data analysis was conducted with machine learning and a 3d visualtion tool that can be used from any modern browser. These two components are described in the following sections.

## Data Analysis

### Data source

The data source was the LUCAS data from the years 2009, 2015, 2018 provided by the challangers located in <data/raw_data>. The microbiome sequencing data was not used due to time constraint of the participants.

### Data cleaning

The data had to be cleaned first to make it uniform between the three years. The following steps were done:

* The columns in the csv had different naming that needed to be understood and related to the other csv files with the information provided in the LUCAS reports.
* Duplicate or columns with lots of missing data were excluded.
* All values which where out of LOD were considered null as it was not clear to us if the data was really out of LOD or missing.

The process written in [LUCAS_Soil_Data_Overview.ipynb](data/LUCAS_Soil_Data_Overview.ipynb) does this and creates and output file [soil-merged.csv](data/soil-merged.csv) that is a uniform table of all three years combined.

![image](data/soil-merged-missing-data.png)
*Figure 1: Overview of missing data represented as a black line*

### Feature engineering


## Visualization


## Possible next steps

## Data

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
