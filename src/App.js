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
          await micropip.install("sad-cin")
          from sad_cin import decision_support
          import json
          
          def get_results(json_str):
              data = json.loads(json_str)
              result = decision_support(data)
              return json.dumps(result)
          `);

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
      const calculateResults = pyodide.globals.get("fuzzy_topsis");
      
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