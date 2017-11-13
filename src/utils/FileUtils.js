/**
 * Process the contents of a file and return data for table
 * @param  {String} fileContent The contents of file
 * @param  {String} fileName    The name of the file
 * @return {Object}             The tabular form for showing in table
 */
export function processFile(fileContent, fileName) {
  let rowVariables = [], data = [];
  // Test if its csv.
  if (fileName.indexOf(".csv") !== -1) {
    let lines = fileContent.split("\n");
    // Find out potential delimiters.
    let csvHeader = lines.shift();
    let delimiter = identifyDelimiter(csvHeader);
    if (delimiter) {
      rowVariables = csvHeader.split(delimiter).map((r) => r.trim());
      lines.forEach((line) => {
        if (line && line.length) {
          data.push(line.split(delimiter).map((s) => Number(s.trim())));
        }
      });
    }
  }
  return {
    rowVariables,
    data: transpose(data)
  };
};

function transpose(data) {
  let transposed = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      transposed[j] = transposed[j] || [];
      transposed[j][i] = data[i][j];
    }
  }
  return transposed;
}

function identifyDelimiter(csvHeader) {
  // Given csvHeader, identify delimiter
  let delimiters = [ ",",
    "\t",
    ";",
    "|",
    ":"
  ];
  for (let i = 0; i < delimiters.length; i++) {
    let delimiter = delimiters[i];
    let result = csvHeader.match(new RegExp(delimiter, "g"));
    if (result && result.length) {
      return delimiter;
    }
  }
}
