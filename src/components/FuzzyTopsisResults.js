import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box
} from '@mui/material';

const FuzzyTopsisResults = ({ results }) => {
  if (!results) return null;

  const { distances, rankings, sortedAlternatives, bestAlternative } = results;

  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Resultados Fuzzy TOPSIS
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="primary" gutterBottom>
          Melhor Alternativa: {bestAlternative}
        </Typography>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Classificação
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Posição</TableCell>
              <TableCell>Alternativa</TableCell>
              <TableCell>Pontuação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAlternatives.map((alt, index) => (
              <TableRow
                key={alt}
                sx={
                  alt === bestAlternative
                    ? { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                    : {}
                }
              >
                <TableCell>{index + 1}º</TableCell>
                <TableCell>{alt}</TableCell>
                <TableCell>{rankings[alt].toFixed(4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="subtitle1" gutterBottom>
        Distâncias
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Alternativa</TableCell>
              <TableCell>Distância para FPIS (d+)</TableCell>
              <TableCell>Distância para FNIS (d-)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAlternatives.map((alt) => (
              <TableRow
                key={alt}
                sx={
                  alt === bestAlternative
                    ? { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                    : {}
                }
              >
                <TableCell>{alt}</TableCell>
                <TableCell>{distances[alt].dPlus.toFixed(4)}</TableCell>
                <TableCell>{distances[alt].dMinus.toFixed(4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default FuzzyTopsisResults; 