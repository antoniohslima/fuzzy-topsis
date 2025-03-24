import React, { useState } from 'react';
import { Container, Typography, Box, CssBaseline, createTheme, ThemeProvider } from '@mui/material';
import FuzzyTopsisForm from './components/FuzzyTopsisForm';
import FuzzyTopsisResults from './components/FuzzyTopsisResults';
import { processFuzzyTopsis } from './utils/fuzzyTopsis';

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

  const handleCalculate = (data) => {
    try {
      const calculatedResults = processFuzzyTopsis(data);
      setResults(calculatedResults);
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