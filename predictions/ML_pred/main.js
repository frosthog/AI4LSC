
//Coarse,Clay,Silt,Sand,pH_H2O,pH_CaCl2,OC,CaCO3,N,P,K,CEC,Elevation,slope (Degrees),EC

function loadCSVData(url)
{
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            download: true,
            header: true,
            complete: function(results) {
                resolve(results.data);
            },
            error: function(err) {
                console.error("Error parsing CSV:", err);
                reject(err);
            }
        });
    });
}

function downloadCSV(csvData, filename)
{
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getRandomValueInRange(min, max)
{
    return parseFloat((Math.random() * (max - min) + min).toFixed(5));
}

function formatWithPrecision(number, precision)
{
    return Number.parseFloat(number).toFixed(precision);
}

function quadraticRegression(x, y)
{
    const x1 = x[0], x2 = x[1], x3 = x[2];
    const y1 = y[0], y2 = y[1], y3 = y[2];

    const a = ((y3 - ((x3 * (y2 - y1) + x2 * y1 - x1 * y2) / (x2 - x1))) / (x3 * (x3 - x1 - x2) + x1 * x2));
    const b = ((y2 - y1) / (x2 - x1)) - a * (x1 + x2);
    const c = (y1 - a * x1 * x1 - b * x1);

    return {a, b, c};
}

function predictQuadraticValue(year, a, b, c)
{
    return a * year * year + b * year + c;
}

function clamp(value, min, max)
{
    return Math.min(Math.max(value, min), max);
}

function predictValueFromPattern(yearToPredict, knownYears, knownValues, min, max, randomFactor)
{
    const { a, b, c } = quadraticRegression(knownYears, knownValues);

    let predicted = predictQuadraticValue(yearToPredict, a, b, c);
    predicted *= randomFactor;
    predicted = clamp(predicted, min, max);

    return predicted;
}

function handleCSVData(data)
{
    const features = ['Coarse', 'Clay', 'Silt', 'Sand', 'pH_H2O', 'pH_CaCl2', 'OC', 'CaCO3', 'N', 'P', 'K', 'CEC', 'Elevation', 'slope (Degrees)', 'EC'];

    const groupedData = {};
    const pointId2018Data = {};

    data.forEach(row => {
        if (!groupedData[row.POINT_ID])
        {
            groupedData[row.POINT_ID] = [];
        }

        if (row.SURVEY_YEAR === "2018")
        {
            pointId2018Data[row.POINT_ID] = {
                LONG: row.LONG,
                LAT: row.LAT,
                MAIN_CLIMA: row.MAIN_CLIMA,
                SURVEY_MONTH: row.SURVEY_MONTH
            };
        }

        const formattedRow = { ...row };
        features.forEach(feature => {
            if (row[feature] !== undefined && !isNaN(row[feature])) {
                formattedRow[feature] = formatWithPrecision(parseFloat(row[feature]), 5);
            }
        });
        groupedData[row.POINT_ID].push(formattedRow);
    });

    for (const pointId in groupedData)
    {
        let minValues = {};
        let maxValues = {};
        features.forEach(feature => {
            minValues[feature] = null;
            maxValues[feature] = null;
        });

        let existingYears = new Set();
        groupedData[pointId].forEach(row => {
            existingYears.add(row.SURVEY_YEAR);
            features.forEach(feature => {
                let value = parseFloat(row[feature]);
                if (!isNaN(value))
                {
                    minValues[feature] = minValues[feature] === null ? value : Math.min(minValues[feature], value);
                    maxValues[feature] = maxValues[feature] === null ? value : Math.max(maxValues[feature], value);
                }
            });

            if (pointId2018Data[pointId])
            {
                row.LONG = pointId2018Data[pointId].LONG;
                row.LAT = pointId2018Data[pointId].LAT;
                row.MAIN_CLIMA = pointId2018Data[pointId].MAIN_CLIMA;
                row.SURVEY_MONTH = pointId2018Data[pointId].SURVEY_MONTH;
            }
        });

        let allFeaturesValid = features.every(feature => minValues[feature] !== null && maxValues[feature] !== null);

        if (allFeaturesValid)
        {
            for (let year = 2009; year <= 2050; year++)
            {
                if (!existingYears.has(year.toString()))
                {
                    let newRow = { POINT_ID: pointId, SURVEY_YEAR: year };
                    features.forEach(feature =>
                    {
                        newRow[feature] = formatWithPrecision(getRandomValueInRange(minValues[feature], maxValues[feature]), 5);
                    });

                    if (pointId2018Data[pointId])
                    {
                        newRow.LONG = pointId2018Data[pointId].LONG;
                        newRow.LAT = pointId2018Data[pointId].LAT;
                        newRow.MAIN_CLIMA = pointId2018Data[pointId].MAIN_CLIMA;
                        newRow.SURVEY_MONTH = pointId2018Data[pointId].SURVEY_MONTH;
                    }

                    groupedData[pointId].push(newRow);
                }
            }
        }
        groupedData[pointId].sort((a, b) => a.SURVEY_YEAR - b.SURVEY_YEAR);
    }

    let flattenedData = [];
    for (const pointId in groupedData)
    {
        flattenedData = flattenedData.concat(groupedData[pointId]);
    }

    const csv = Papa.unparse(flattenedData);
    downloadCSV(csv, 'prediction.csv');

    console.log("Processed and Enhanced Data:", groupedData);
}


function main()
{
    loadCSVData('test.csv')
        .then(data => {
            handleCSVData(data);
        })
        .catch(error => {
            console.error("Error occurred:", error);
        });
}

main();
