
function normalize(value, min, max)
{
    const normalized = (value - min) / (max - min);
    return parseFloat(normalized.toFixed(5));
}

function processCSV(data)
{
    const columnsToNormalize = ['Coarse', 'Clay', 'Silt', 'Sand', 'pH_H2O', 'pH_CaCl2', 'OC', 'CaCO3', 'N', 'P', 'K', 'CEC', 'Elevation', 'slope (Degrees)', 'EC'];

    const requiredYears = [2009, 2015, 2018];
    const groupedData = data.reduce((acc, row) => {
        const pointId = parseInt(row['POINT_ID']);
        if (!acc[pointId])
        {
            acc[pointId] = [];
        }
        acc[pointId].push(row);
        return acc;
    }, {});

    const filteredData = Object.values(groupedData).filter(group =>{
        const years = group.map(row => parseInt(row['SURVEY_YEAR']));
        const meetsRequirement = requiredYears.every(year => years.includes(year));
        if (!meetsRequirement) {
            console.log(`POINT_ID ${group[0]['POINT_ID']} does not meet the requirement`);
        }
        return meetsRequirement;
    }).flat();

    if (filteredData.length === 0)
    {
        console.log("No data points meet the required years condition");
        return [];
    }

    const minMaxValues = {};
    columnsToNormalize.forEach(col => {
        const numericValues = filteredData.map(row => parseFloat(row[col])).filter(val => !isNaN(val));
        minMaxValues[col] = {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues)
        };
    });

    return filteredData.map(row => {
        row['POINT_ID'] = parseInt(row['POINT_ID']);
        row['SURVEY_YEAR'] = parseInt(row['SURVEY_YEAR']);
        row['MAIN_CLIMA'] = parseInt(row['MAIN_CLIMA']);
        row['SURVEY_MONTH'] = parseInt(row['SURVEY_MONTH']);

        columnsToNormalize.forEach(col => {
            const value = parseFloat(row[col]);
            if (!isNaN(value)) {
                row[col] = normalize(value, minMaxValues[col].min, minMaxValues[col].max);
            } else {
                row[col] = 'NA';
            }
        });

        return row;
    });
}

Papa.parse('soil_imputed_data.csv', {
    download: true,
    header: true,
    complete: function(results) {
        const processedData = processCSV(results.data);

        const csv = Papa.unparse(processedData);

        const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement("a");
        const url = URL.createObjectURL(csvBlob);
        link.href = url;
        link.download = "normalized_clean.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        console.log("CSV file created and available for download.");
    }
});
