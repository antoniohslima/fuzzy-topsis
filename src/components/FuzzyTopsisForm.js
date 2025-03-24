import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const FuzzyTopsisForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    alternatives: ['F1'],
    criteria: ['C1'],
    performance_matrix: {
      F1: [[0.6, 0.7, 0.8]]
    },
    criteria_types: {
      C1: 'max'
    },
    weights: {
      C1: [0.3, 0.4, 0.5]
    }
  });

  const addAlternative = () => {
    const newAlt = `F${formData.alternatives.length + 1}`;
    setFormData(prev => ({
      ...prev,
      alternatives: [...prev.alternatives, newAlt],
      performance_matrix: {
        ...prev.performance_matrix,
        [newAlt]: Array(prev.criteria.length).fill([0, 0, 0])
      }
    }));
  };

  const addCriterion = () => {
    const newCrit = `C${formData.criteria.length + 1}`;
    setFormData(prev => ({
      ...prev,
      criteria: [...prev.criteria, newCrit],
      criteria_types: {
        ...prev.criteria_types,
        [newCrit]: 'max'
      },
      weights: {
        ...prev.weights,
        [newCrit]: [0, 0, 0]
      },
      performance_matrix: Object.fromEntries(
        Object.entries(prev.performance_matrix).map(([alt, values]) => [
          alt,
          [...values, [0, 0, 0]]
        ])
      )
    }));
  };

  const removeAlternative = (index) => {
    const alt = formData.alternatives[index];
    setFormData(prev => {
      const { [alt]: removed, ...restMatrix } = prev.performance_matrix;
      return {
        ...prev,
        alternatives: prev.alternatives.filter((_, i) => i !== index),
        performance_matrix: restMatrix
      };
    });
  };

  const removeCriterion = (index) => {
    const crit = formData.criteria[index];
    setFormData(prev => {
      const { [crit]: removedType, ...restTypes } = prev.criteria_types;
      const { [crit]: removedWeight, ...restWeights } = prev.weights;
      return {
        ...prev,
        criteria: prev.criteria.filter((_, i) => i !== index),
        criteria_types: restTypes,
        weights: restWeights,
        performance_matrix: Object.fromEntries(
          Object.entries(prev.performance_matrix).map(([alt, values]) => [
            alt,
            values.filter((_, i) => i !== index)
          ])
        )
      };
    });
  };

  const handlePerformanceChange = (alt, critIndex, valueIndex, value) => {
    setFormData(prev => ({
      ...prev,
      performance_matrix: {
        ...prev.performance_matrix,
        [alt]: prev.performance_matrix[alt].map((crit, i) =>
          i === critIndex
            ? crit.map((v, j) => (j === valueIndex ? parseFloat(value) || 0 : v))
            : crit
        )
      }
    }));
  };

  const handleWeightChange = (crit, index, value) => {
    setFormData(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [crit]: prev.weights[crit].map((w, i) =>
          i === index ? parseFloat(value) || 0 : w
        )
      }
    }));
  };

  const handleCriterionTypeChange = (crit, value) => {
    setFormData(prev => ({
      ...prev,
      criteria_types: {
        ...prev.criteria_types,
        [crit]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      method: 'Fuzzy_TOPSIS',
      parameters: formData
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Dados de Entrada Fuzzy TOPSIS
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={addAlternative}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Adicionar Alternativa
          </Button>
          <Button
            startIcon={<AddIcon />}
            onClick={addCriterion}
            variant="outlined"
          >
            Adicionar Critério
          </Button>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Matriz de Desempenho
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            <Box sx={{ gridColumn: 'span 1' }}>
              <Typography variant="subtitle2">Alternativa</Typography>
            </Box>
            {formData.criteria.map((crit, critIndex) => (
              <Box sx={{ gridColumn: 'span 1' }} key={crit}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle2">{crit}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeCriterion(critIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={formData.criteria_types[crit]}
                    label="Tipo"
                    onChange={(e) =>
                      handleCriterionTypeChange(crit, e.target.value)
                    }
                  >
                    <MenuItem value="max">Maximizar</MenuItem>
                    <MenuItem value="min">Minimizar</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            ))}
          </Box>

          {formData.alternatives.map((alt, altIndex) => (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }} key={alt}>
              <Box sx={{ gridColumn: 'span 1' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>{alt}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeAlternative(altIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              {formData.criteria.map((crit, critIndex) => (
                <Box sx={{ gridColumn: 'span 1' }} key={`${alt}-${crit}`}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[0, 1, 2].map((valueIndex) => (
                      <TextField
                        key={`${alt}-${crit}-${valueIndex}`}
                        size="small"
                        type="number"
                        inputProps={{
                          step: 0.1,
                          min: 0,
                          max: 1
                        }}
                        value={
                          formData.performance_matrix[alt][critIndex][valueIndex]
                        }
                        onChange={(e) =>
                          handlePerformanceChange(
                            alt,
                            critIndex,
                            valueIndex,
                            e.target.value
                          )
                        }
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Pesos dos Critérios
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            {formData.criteria.map((crit) => (
              <Box sx={{ gridColumn: 'span 1' }} key={crit}>
                <Typography variant="subtitle2">{crit}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[0, 1, 2].map((index) => (
                    <TextField
                      key={`weight-${crit}-${index}`}
                      size="small"
                      type="number"
                      inputProps={{
                        step: 0.1,
                        min: 0,
                        max: 1
                      }}
                      value={formData.weights[crit][index]}
                      onChange={(e) =>
                        handleWeightChange(crit, index, e.target.value)
                      }
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Button type="submit" variant="contained" color="primary">
          Calcular
        </Button>
      </form>
    </Paper>
  );
};

export default FuzzyTopsisForm; 