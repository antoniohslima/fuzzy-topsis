// Fuzzy TOPSIS implementation

// Normalize the fuzzy decision matrix
export const normalizeFuzzyMatrix = (matrix, criteria_types) => {
  const normalized = {};
  const maxValues = {};
  const minValues = {};

  // Find max and min values for each criterion
  Object.keys(matrix).forEach(alt => {
    matrix[alt].forEach((criterion, idx) => {
      const criterionName = `C${idx + 1}`;
      if (!maxValues[criterionName]) maxValues[criterionName] = criterion[2];
      if (!minValues[criterionName]) minValues[criterionName] = criterion[0];

      maxValues[criterionName] = Math.max(maxValues[criterionName], criterion[2]);
      minValues[criterionName] = Math.min(minValues[criterionName], criterion[0]);
    });
  });

  // Normalize the matrix
  Object.keys(matrix).forEach(alt => {
    normalized[alt] = matrix[alt].map((criterion, idx) => {
      const criterionName = `C${idx + 1}`;
      if (criteria_types[criterionName] === 'max') {
        return [
          criterion[0] / maxValues[criterionName],
          criterion[1] / maxValues[criterionName],
          criterion[2] / maxValues[criterionName]
        ];
      } else {
        return [
          minValues[criterionName] / criterion[2],
          minValues[criterionName] / criterion[1],
          minValues[criterionName] / criterion[0]
        ];
      }
    });
  });

  return normalized;
};

// Calculate weighted normalized fuzzy decision matrix
export const calculateWeightedMatrix = (normalizedMatrix, weights) => {
  const weighted = {};
  
  Object.keys(normalizedMatrix).forEach(alt => {
    weighted[alt] = normalizedMatrix[alt].map((criterion, idx) => {
      const criterionName = `C${idx + 1}`;
      const weight = weights[criterionName];
      return [
        criterion[0] * weight[0],
        criterion[1] * weight[1],
        criterion[2] * weight[2]
      ];
    });
  });

  return weighted;
};

// Calculate fuzzy positive ideal solution (FPIS) and fuzzy negative ideal solution (FNIS)
export const calculateIdealSolutions = (weightedMatrix) => {
  const numCriteria = Object.values(weightedMatrix)[0].length;
  const fpis = Array(numCriteria).fill([1, 1, 1]);
  const fnis = Array(numCriteria).fill([0, 0, 0]);
  
  return { fpis, fnis };
};

// Calculate distance from FPIS and FNIS
export const calculateDistances = (weightedMatrix, fpis, fnis) => {
  const distances = {};
  
  Object.keys(weightedMatrix).forEach(alt => {
    let dPlus = 0;
    let dMinus = 0;
    
    weightedMatrix[alt].forEach((criterion, idx) => {
      // Distance from FPIS
      dPlus += Math.sqrt(
        ((criterion[0] - fpis[idx][0]) ** 2 +
         (criterion[1] - fpis[idx][1]) ** 2 +
         (criterion[2] - fpis[idx][2]) ** 2) / 3
      );
      
      // Distance from FNIS
      dMinus += Math.sqrt(
        ((criterion[0] - fnis[idx][0]) ** 2 +
         (criterion[1] - fnis[idx][1]) ** 2 +
         (criterion[2] - fnis[idx][2]) ** 2) / 3
      );
    });
    
    distances[alt] = { dPlus, dMinus };
  });
  
  return distances;
};

// Calculate closeness coefficient and rank alternatives
export const calculateRankings = (distances) => {
  const rankings = {};
  
  Object.keys(distances).forEach(alt => {
    const { dPlus, dMinus } = distances[alt];
    rankings[alt] = dMinus / (dPlus + dMinus);
  });
  
  return rankings;
};

// Main function to process Fuzzy TOPSIS
export const processFuzzyTopsis = (data) => {
  const { alternatives, criteria, performance_matrix, criteria_types, weights } = data.parameters;
  
  // Step 1: Normalize the fuzzy decision matrix
  const normalizedMatrix = normalizeFuzzyMatrix(performance_matrix, criteria_types);
  
  // Step 2: Calculate the weighted normalized fuzzy decision matrix
  const weightedMatrix = calculateWeightedMatrix(normalizedMatrix, weights);
  
  // Step 3: Determine FPIS and FNIS
  const { fpis, fnis } = calculateIdealSolutions(weightedMatrix);
  
  // Step 4: Calculate distances
  const distances = calculateDistances(weightedMatrix, fpis, fnis);
  
  // Step 5: Calculate closeness coefficients and rankings
  const rankings = calculateRankings(distances);
  
  // Sort alternatives by ranking
  const sortedAlternatives = Object.entries(rankings)
    .sort(([, a], [, b]) => b - a)
    .map(([alt]) => alt);
  
  return {
    distances,
    rankings,
    sortedAlternatives,
    bestAlternative: sortedAlternatives[0]
  };
}; 