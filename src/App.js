import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CssBaseline, createTheme, ThemeProvider } from '@mui/material';
import FuzzyTopsisForm from './components/FuzzyTopsisForm';
import FuzzyTopsisResults from './components/FuzzyTopsisResults';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [results, setResults] = useState(null);

  const [pyodide, setPyodide] = useState(null);
  const [loadingPyodide, setLoadingPyodide] = useState(true);

  useEffect(() => {
    async function loadPyodideAndPackages() {
      try {
        const pyodideInstance = await window.loadPyodide();
        await pyodideInstance.loadPackage("micropip");

        await pyodideInstance.runPythonAsync(`
          import micropip
          await micropip.install("numpy")
          await micropip.install("pandas")

          import numpy as np
          import pandas as pd
          import json

          class FuzzyTOPSIS:
              """
              Implementação do algoritmo Fuzzy TOPSIS para tomada de decisão multicritério
              adaptado para processar dados de entrada em formato JSON.
              """
              
              def __init__(self, json_data):
                  """
                  Inicializa o algoritmo Fuzzy TOPSIS com dados em formato JSON.
                  
                  Parâmetros:
                  -----------
                  json_data : str ou dict
                      Dados de entrada em formato JSON ou dicionário Python
                  """
                  # Carrega os dados JSON se for uma string
                  if isinstance(json_data, str):
                      self.data = json.loads(json_data)
                  else:
                      self.data = json_data
                      
                  # Extrai os parâmetros do JSON
                  params = self.data["parameters"]
                  self.alternatives = params["alternatives"]
                  self.criteria = params["criteria"]
                  
                  # Converte a matriz de desempenho para o formato necessário
                  self.decision_matrix = self._convert_performance_matrix(params["performance_matrix"])
                  
                  # Converte os tipos de critérios para o formato necessário (1 para max, -1 para min)
                  self.criteria_type = self._convert_criteria_types(params["criteria_types"])
                  
                  # Converte os pesos para o formato necessário
                  self.weights = self._convert_weights(params["weights"])
                  
              def _convert_performance_matrix(self, performance_dict):
                  """
                  Converte a matriz de desempenho do formato JSON para numpy array.
                  
                  Parâmetros:
                  -----------
                  performance_dict : dict
                      Matriz de desempenho no formato do JSON
                      
                  Retorna:
                  --------
                  numpy.ndarray
                      Matriz de decisão fuzzy triangular de formato (n_alternativas, n_criterios, 3)
                  """
                  n_alternatives = len(self.alternatives)
                  n_criteria = len(self.criteria)
                  
                  # Inicializa a matriz de decisão
                  decision_matrix = np.zeros((n_alternatives, n_criteria, 3))
                  
                  # Preenche a matriz de decisão
                  for i, alt in enumerate(self.alternatives):
                      for j, crit in enumerate(self.criteria):
                          decision_matrix[i, j] = performance_dict[alt][j]
                          
                  return decision_matrix
              
              def _convert_criteria_types(self, criteria_types_dict):
                  """
                  Converte os tipos de critérios do formato JSON para array numpy.
                  
                  Parâmetros:
                  -----------
                  criteria_types_dict : dict
                      Tipos de critérios no formato do JSON
                      
                  Retorna:
                  --------
                  numpy.ndarray
                      Array com os tipos de critérios (1 para max, -1 para min)
                  """
                  criteria_type = np.zeros(len(self.criteria))
                  
                  for j, crit in enumerate(self.criteria):
                      criteria_type[j] = 1 if criteria_types_dict[crit] == "max" else -1
                          
                  return criteria_type
              
              def _convert_weights(self, weights_dict):
                  """
                  Converte os pesos do formato JSON para array numpy.
                  
                  Parâmetros:
                  -----------
                  weights_dict : dict
                      Pesos no formato do JSON
                      
                  Retorna:
                  --------
                  numpy.ndarray
                      Array com os pesos fuzzy triangulares de formato (n_criterios, 3)
                  """
                  n_criteria = len(self.criteria)
                  weights = np.zeros((n_criteria, 3))
                  
                  for j, crit in enumerate(self.criteria):
                      weights[j] = weights_dict[crit]
                          
                  return weights
              
              def normalize_fuzzy_matrix(self, decision_matrix):
                  """
                  Normaliza a matriz de decisão fuzzy.
                  
                  Parâmetros:
                  -----------
                  decision_matrix : numpy.ndarray
                      Matriz de decisão fuzzy triangular
                      
                  Retorna:
                  --------
                  numpy.ndarray
                      Matriz de decisão fuzzy normalizada
                  """
                  n_alternatives = len(self.alternatives)
                  n_criteria = len(self.criteria)
                  
                  normalized_matrix = np.zeros((n_alternatives, n_criteria, 3))
                  
                  for j in range(n_criteria):
                      if self.criteria_type[j] > 0:  # Critério de benefício (max)
                          # Encontra o maior valor superior (u) para o critério
                          c_max = np.max(decision_matrix[:, j, 2])
                          
                          # Normaliza usando c_max para critérios de benefício
                          for i in range(n_alternatives):
                              normalized_matrix[i, j, 0] = decision_matrix[i, j, 0] / c_max
                              normalized_matrix[i, j, 1] = decision_matrix[i, j, 1] / c_max
                              normalized_matrix[i, j, 2] = decision_matrix[i, j, 2] / c_max
                      else:  # Critério de custo (min)
                          # Encontra o menor valor inferior (l) para o critério
                          c_min = np.min(decision_matrix[:, j, 0])
                          
                          # Normaliza usando c_min para critérios de custo
                          for i in range(n_alternatives):
                              normalized_matrix[i, j, 0] = c_min / decision_matrix[i, j, 0]
                              normalized_matrix[i, j, 1] = c_min / decision_matrix[i, j, 1]
                              normalized_matrix[i, j, 2] = c_min / decision_matrix[i, j, 2]
                  
                  return normalized_matrix
              
              def calculate_weighted_matrix(self, normalized_matrix):
                  """
                  Calcula a matriz de decisão fuzzy normalizada ponderada.
                  
                  Parâmetros:
                  -----------
                  normalized_matrix : numpy.ndarray
                      Matriz de decisão fuzzy normalizada
                      
                  Retorna:
                  --------
                  numpy.ndarray
                      Matriz de decisão fuzzy normalizada ponderada
                  """
                  n_alternatives = len(self.alternatives)
                  n_criteria = len(self.criteria)
                  
                  weighted_matrix = np.zeros((n_alternatives, n_criteria, 3))
                  
                  for i in range(n_alternatives):
                      for j in range(n_criteria):
                          # Multiplicação de números fuzzy triangulares
                          weighted_matrix[i, j, 0] = normalized_matrix[i, j, 0] * self.weights[j, 0]
                          weighted_matrix[i, j, 1] = normalized_matrix[i, j, 1] * self.weights[j, 1]
                          weighted_matrix[i, j, 2] = normalized_matrix[i, j, 2] * self.weights[j, 2]
                  
                  return weighted_matrix
              
              def calculate_fpis_fnis(self, weighted_matrix):                     
                  """
                  Calcula a Solução Ideal Positiva Fuzzy (FPIS) e Solução Ideal Negativa Fuzzy (FNIS).
                  
                  Parâmetros:
                  -----------
                  weighted_matrix : numpy.ndarray
                      Matriz de decisão fuzzy normalizada ponderada
                      
                  Retorna:
                  --------
                  tuple
                      (FPIS, FNIS)
                  """
                  n_criteria = len(self.criteria)
                  
                  # Inicializa FPIS e FNIS
                  fpis = np.zeros((n_criteria, 3))
                  fnis = np.zeros((n_criteria, 3))
                  
                  fpis_max = []
                  fnis_min = []

                  for j in range(n_criteria):
                      fpis[j] = [np.max(weighted_matrix[:, j, 2]), np.max(weighted_matrix[:, j, 2]), np.max(weighted_matrix[:, j, 2])]
                      fnis[j] = [np.min(weighted_matrix[:, j, 0]), np.min(weighted_matrix[:, j, 0]), np.min(weighted_matrix[:, j, 0])]
                          
                  return fpis, fnis
              
              def calculate_distances(self, weighted_matrix, fpis, fnis):
                  """
                  Calcula as distâncias de cada alternativa para FPIS e FNIS.
                  
                  Parâmetros:
                  -----------
                  weighted_matrix : numpy.ndarray
                      Matriz de decisão fuzzy normalizada ponderada
                  fpis : numpy.ndarray
                      Solução Ideal Positiva Fuzzy
                  fnis : numpy.ndarray
                      Solução Ideal Negativa Fuzzy
                      
                  Retorna:
                  --------
                  tuple
                      (distâncias para FPIS, distâncias para FNIS)
                  """
                  n_alternatives = len(self.alternatives)
                  n_criteria = len(self.criteria)
                  
                  # Correção: inicializa as distâncias como arrays
                  fpis_distances = np.zeros(n_alternatives)
                  fnis_distances = np.zeros(n_alternatives)
                  
                  for i in range(n_alternatives):
                      fpis_dist_sum = 0
                      fnis_dist_sum = 0
                      
                      for j in range(n_criteria):
                          # Distância euclidiana entre números fuzzy triangulares
                          # Correção: fórmula de distância
                          fpis_dist_sum += np.sqrt((1/3) * ((weighted_matrix[i, j, 0] - fpis[j, 0])**2 + 
                                                (weighted_matrix[i, j, 1] - fpis[j, 1])**2 + 
                                                (weighted_matrix[i, j, 2] - fpis[j, 2])**2))
                          
                          fnis_dist_sum += np.sqrt((1/3) * ((weighted_matrix[i, j, 0] - fnis[j, 0])**2 + 
                                                (weighted_matrix[i, j, 1] - fnis[j, 1])**2 + 
                                                (weighted_matrix[i, j, 2] - fnis[j, 2])**2))
                      
                      # Calcula a raiz quadrada para obter a distância euclidiana
                      fpis_distances[i] = fpis_dist_sum
                      fnis_distances[i] = fnis_dist_sum
                  
                  # Normalização das distâncias para obter os valores esperados
                  
                  return fpis_distances, fnis_distances
              
              def calculate_closeness_coefficients(self, fpis_distances, fnis_distances):
                  """
                  Calcula os coeficientes de proximidade para cada alternativa.
                  
                  Parâmetros:
                  -----------
                  fpis_distances : numpy.ndarray
                      Distâncias para Solução Ideal Positiva Fuzzy
                  fnis_distances : numpy.ndarray
                      Distâncias para Solução Ideal Negativa Fuzzy
                      
                  Retorna:
                  --------
                  numpy.ndarray
                      Coeficientes de proximidade
                  """

                  closeness_coefficients = []

                  for i in range(len(self.criteria)):
                      closeness_coefficients.append(fnis_distances[i]/(fnis_distances[i]+fpis_distances[i]))
                  
                  return closeness_coefficients
              
              def rank_alternatives(self):
                  """
                  Aplica o algoritmo Fuzzy TOPSIS para rankear as alternativas.
                  
                  Retorna:
                  --------
                  dict
                      Resultados em formato JSON específico
                  """
                  # Normaliza a matriz de decisão
                  normalized_matrix = self.normalize_fuzzy_matrix(self.decision_matrix)
                  
                  # Calcula a matriz ponderada
                  weighted_matrix = self.calculate_weighted_matrix(normalized_matrix)
                  
                  # Calcula FPIS e FNIS
                  fpis, fnis = self.calculate_fpis_fnis(weighted_matrix)
                  
                  # Calcula as distâncias
                  fpis_distances, fnis_distances = self.calculate_distances(weighted_matrix, fpis, fnis)
                  
                  # Calcula os coeficientes de proximidade (agora são as distâncias normalizadas para FNIS)
                  closeness_coefficients = self.calculate_closeness_coefficients(fpis_distances, fnis_distances)
                  
                  # Cria um DataFrame com os resultados
                  results_df = pd.DataFrame({
                      'Alternative': self.alternatives,
                      'Proximity': closeness_coefficients,
                      'Ideal_Distance': fpis_distances,
                      'Negative_Ideal_Distance': fnis_distances
                  })
                  
                  # Ordena pelo coeficiente de proximidade em ordem decrescente
                  results_df = results_df.sort_values('Proximity', ascending=False)
                  
                  # Formata o JSON de saída conforme especificado
                  results_json = {
                      "results": {
                          "proximities": {},
                          "ranking": results_df['Alternative'].tolist(),
                          "best_alternative": results_df['Alternative'].iloc[0],
                          "distances": {}
                      }
                  }
                  
                  # Preenche as proximidades e distâncias para cada alternativa
                  for _, row in results_df.iterrows():
                      alt = row['Alternative']
                      proximity = round(float(row['Proximity']), 2)  # Arredonda para 2 casas decimais
                      ideal_distance = round(float(row['Ideal_Distance']), 2)
                      negative_ideal_distance = round(float(row['Negative_Ideal_Distance']), 2)
                      
                      # Adiciona à estrutura JSON
                      results_json["results"]["proximities"][alt] = proximity
                      results_json["results"]["distances"][alt] = {
                          "ideal": ideal_distance,
                          "negative_ideal": negative_ideal_distance
                      }
                  
                  return results_json

          # Função para processar a entrada JSON
          def process_fuzzy_topsis(json_input):
              """
              Processa a entrada JSON e executa o algoritmo Fuzzy TOPSIS.
              
              Parâmetros:
              -----------
              json_input : str ou dict
                  Dados de entrada em formato JSON ou dicionário Python
                  
              Retorna:
              --------
              dict
                  Resultados em formato JSON específico
              """
              try:
                  # Inicializa o algoritmo Fuzzy TOPSIS com os dados JSON
                  fuzzy_topsis = FuzzyTOPSIS(json_input)
                  
                  # Executa o algoritmo e obtém os resultados
                  results = fuzzy_topsis.rank_alternatives()
                  
                  return json.dumps(results)
              
              except Exception as e:
                  # Retorna erro em formato JSON
                  return {
                      "error": True,
                      "message": str(e)
                  }

          # Se este script for executado diretamente
          if __name__ == "__main__":
              # Exemplo de JSON de entrada
              sample_json = '''
              {
                "parameters": {
                  "alternatives": ["F1", "F2", "F3"],
                  "criteria": ["C1", "C2", "C3"],
                  "performance_matrix": {
                    "F1": [[0.6, 0.7, 0.8], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]],
                    "F2": [[0.5, 0.6, 0.7], [0.3, 0.4, 0.5], [0.6, 0.7, 0.8]],
                    "F3": [[0.7, 0.8, 0.9], [0.5, 0.6, 0.7], [0.8, 0.9, 1.0]]
                  },
                  "criteria_types": {
                    "C1": "max",
                    "C2": "min",
                    "C3": "max"
                  },
                  "weights": {
                    "C1": [0.3, 0.4, 0.5],
                    "C2": [0.2, 0.3, 0.4],
                    "C3": [0.4, 0.5, 0.6]
                  }
                }
              }
              '''
          `
        );

        setPyodide(pyodideInstance);
      } catch (error) {
        console.error("Erro ao carregar o Pyodide:", error);
      } finally {
        setLoadingPyodide(false);
      }
    }
    loadPyodideAndPackages();
  }, []);

  const handleCalculate = (data) => {
    try {
      const calculateResults = pyodide.globals.get("process_fuzzy_topsis");
      const results = calculateResults(JSON.stringify(data));

      setResults(JSON.parse(results));
    } catch (error) {
      console.error('Erro ao calcular resultados:', error);
      alert('Erro ao calcular resultados. Por favor, verifique os dados inseridos.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Calculadora Fuzzy TOPSIS
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
            Tomada de Decisão Multicritério usando o método Fuzzy TOPSIS
          </Typography>
          
          <FuzzyTopsisForm onSubmit={handleCalculate} />
          {results && <FuzzyTopsisResults results={results} />}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 