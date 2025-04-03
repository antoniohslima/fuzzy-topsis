import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

const FuzzyTopsisForm = ({ onSubmit }) => {
  // Linguistic variables for weights and ratings
  const linguisticVariables = {
    weights: [
      { label: 'Muito Baixo', values: [0.0, 0.0, 0.1] },
      { label: 'Baixo', values: [0.0, 0.1, 0.3] },
      { label: 'Médio-Baixo', values: [0.1, 0.3, 0.5] },
      { label: 'Médio', values: [0.3, 0.5, 0.7] },
      { label: 'Médio-Alto', values: [0.5, 0.7, 0.9] },
      { label: 'Alto', values: [0.7, 0.9, 1.0] },
      { label: 'Muito Alto', values: [0.9, 1.0, 1.0] }
    ],
    ratings: [
      { label: 'Muito Pobre', values: [0.0, 0.0, 0.1] },
      { label: 'Pobre', values: [0.0, 0.1, 0.3] },
      { label: 'Médio-Pobre', values: [0.1, 0.3, 0.5] },
      { label: 'Médio', values: [0.3, 0.5, 0.7] },
      { label: 'Médio-Bom', values: [0.5, 0.7, 0.9] },
      { label: 'Bom', values: [0.7, 0.9, 1.0] },
      { label: 'Muito Bom', values: [0.9, 1.0, 1.0] }
    ]
  };

  // Form data state
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

  // State for selected linguistic terms
  const [selectedWeightTerms, setSelectedWeightTerms] = useState({});
  const [selectedRatingTerms, setSelectedRatingTerms] = useState({});

  // Input validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Dialog state for naming alternatives and criteria
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'alternative' or 'criterion'
  const [dialogName, setDialogName] = useState('');

  // Dialog state for linguistic variables table
  const [linguisticTableOpen, setLinguisticTableOpen] = useState(false);

  // Dialog state for bulk input
  const [bulkInputOpen, setBulkInputOpen] = useState(false);
  const [bulkInputType, setBulkInputType] = useState(''); // 'alternatives' or 'criteria'
  const [bulkInputValue, setBulkInputValue] = useState('');

  // Dialog state for performance matrix input
  const [performanceInputOpen, setPerformanceInputOpen] = useState(false);
  const [performanceInputAlt, setPerformanceInputAlt] = useState('');
  const [performanceInputCrit, setPerformanceInputCrit] = useState('');
  const [performanceInputValue, setPerformanceInputValue] = useState('');

  // Dialog state for weight input
  const [weightInputOpen, setWeightInputOpen] = useState(false);
  const [weightInputCrit, setWeightInputCrit] = useState('');
  const [weightInputValue, setWeightInputValue] = useState('');

  // Open/close dialog functions
  const openDialog = (type) => {
    setDialogType(type);
    setDialogName('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const openLinguisticTable = () => {
    setLinguisticTableOpen(true);
  };

  const closeLinguisticTable = () => {
    setLinguisticTableOpen(false);
  };

  const openBulkInput = (type) => {
    setBulkInputType(type);
    setBulkInputValue('');
    setBulkInputOpen(true);
  };

  const closeBulkInput = () => {
    setBulkInputOpen(false);
  };

  const openPerformanceInput = (alt, crit) => {
    setPerformanceInputAlt(alt);
    setPerformanceInputCrit(crit);
    setPerformanceInputValue('');
    setPerformanceInputOpen(true);
  };

  const closePerformanceInput = () => {
    setPerformanceInputOpen(false);
  };

  const openWeightInput = (crit) => {
    setWeightInputCrit(crit);
    setWeightInputValue('');
    setWeightInputOpen(true);
  };

  const closeWeightInput = () => {
    setWeightInputOpen(false);
  };

  // Handle dialog submissions
  const handleDialogSubmit = () => {
    if (dialogName.trim()) {
      if (dialogType === 'alternative') {
        addAlternativeWithName(dialogName.trim());
      } else if (dialogType === 'criterion') {
        addCriterionWithName(dialogName.trim());
      }
      closeDialog();
    }
  };

  const handleBulkInputSubmit = () => {
    if (bulkInputValue.trim()) {
      const items = bulkInputValue.split(',').map(item => item.trim()).filter(item => item);
      
      if (bulkInputType === 'alternatives') {
        items.forEach(item => {
          if (!formData.alternatives.includes(item)) {
            addAlternativeWithName(item);
          }
        });
      } else if (bulkInputType === 'criteria') {
        items.forEach(item => {
          if (!formData.criteria.includes(item)) {
            addCriterionWithName(item);
          }
        });
      }
      
      closeBulkInput();
      showSnackbar(`${items.length} ${bulkInputType === 'alternatives' ? 'alternativas' : 'critérios'} adicionados com sucesso!`, 'success');
    }
  };

  const handlePerformanceInputSubmit = () => {
    if (performanceInputValue.trim()) {
      const values = performanceInputValue.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
      
      if (values.length === 3) {
        const altIndex = formData.alternatives.indexOf(performanceInputAlt);
        const critIndex = formData.criteria.indexOf(performanceInputCrit);
        
        if (altIndex !== -1 && critIndex !== -1) {
          setFormData(prev => ({
            ...prev,
            performance_matrix: {
              ...prev.performance_matrix,
              [performanceInputAlt]: prev.performance_matrix[performanceInputAlt].map((crit, i) =>
                i === critIndex ? values : crit
              )
            }
          }));
          
          closePerformanceInput();
          showSnackbar('Valor de desempenho atualizado com sucesso!', 'success');
        }
      } else {
        showSnackbar('Por favor, insira exatamente 3 valores separados por vírgula.', 'error');
      }
    }
  };

  const handleWeightInputSubmit = () => {
    if (weightInputValue.trim()) {
      const values = weightInputValue.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
      
      if (values.length === 3) {
        if (formData.criteria.includes(weightInputCrit)) {
          setFormData(prev => ({
            ...prev,
            weights: {
              ...prev.weights,
              [weightInputCrit]: values
            }
          }));
          
          closeWeightInput();
          showSnackbar('Peso atualizado com sucesso!', 'success');
        }
      } else {
        showSnackbar('Por favor, insira exatamente 3 valores separados por vírgula.', 'error');
      }
    }
  };

  // Snackbar functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Alternative and criterion management functions
  const addAlternativeWithName = (name) => {
    // Check if name already exists
    if (formData.alternatives.includes(name)) {
      showSnackbar('Uma alternativa com este nome já existe. Por favor, escolha outro nome.', 'error');
      return;
    }

    setFormData(prev => ({
      ...prev,
      alternatives: [...prev.alternatives, name],
      performance_matrix: {
        ...prev.performance_matrix,
        [name]: Array(prev.criteria.length).fill([0, 0, 0])
      }
    }));
  };

  const addCriterionWithName = (name) => {
    // Check if name already exists
    if (formData.criteria.includes(name)) {
      showSnackbar('Um critério com este nome já existe. Por favor, escolha outro nome.', 'error');
      return;
    }

    setFormData(prev => ({
      ...prev,
      criteria: [...prev.criteria, name],
      criteria_types: {
        ...prev.criteria_types,
        [name]: 'max'
      },
      weights: {
        ...prev.weights,
        [name]: [0, 0, 0]
      },
      performance_matrix: Object.fromEntries(
        Object.entries(prev.performance_matrix).map(([alt, values]) => [
          alt,
          [...values, [0, 0, 0]]
        ])
      )
    }));
    
    // Initialize selected weight term for the new criterion
    setSelectedWeightTerms(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  const addAlternative = () => {
    openDialog('alternative');
  };

  const addCriterion = () => {
    openDialog('criterion');
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
    
    // Remove selected rating terms for the deleted alternative
    setSelectedRatingTerms(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        if (key.startsWith(`${alt}-`)) {
          delete newState[key];
        }
      });
      return newState;
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
    
    // Remove selected weight term for the deleted criterion
    setSelectedWeightTerms(prev => {
      const { [crit]: removed, ...rest } = prev;
      return rest;
    });
    
    // Remove selected rating terms for the deleted criterion
    setSelectedRatingTerms(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        if (key.endsWith(`-${index}`)) {
          delete newState[key];
        }
      });
      return newState;
    });
  };

  // Performance and weight change handlers
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

  // Linguistic term application functions
  const applyLinguisticWeight = (crit, linguisticTerm) => {
    const term = linguisticVariables.weights.find(t => t.label === linguisticTerm);
    if (term) {
      setFormData(prev => ({
        ...prev,
        weights: {
          ...prev.weights,
          [crit]: term.values
        }
      }));
      setSelectedWeightTerms(prev => ({
        ...prev,
        [crit]: linguisticTerm
      }));
      showSnackbar(`Peso "${linguisticTerm}" aplicado ao critério ${crit}`, 'success');
    }
  };

  const applyLinguisticRating = (alt, critIndex, linguisticTerm) => {
    const term = linguisticVariables.ratings.find(t => t.label === linguisticTerm);
    if (term) {
      setFormData(prev => ({
        ...prev,
        performance_matrix: {
          ...prev.performance_matrix,
          [alt]: prev.performance_matrix[alt].map((crit, i) =>
            i === critIndex ? term.values : crit
          )
        }
      }));
      setSelectedRatingTerms(prev => ({
        ...prev,
        [`${alt}-${critIndex}`]: linguisticTerm
      }));
      showSnackbar(`Avaliação "${linguisticTerm}" aplicada à alternativa ${alt} para o critério ${formData.criteria[critIndex]}`, 'success');
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // Check if there are alternatives and criteria
    if (formData.alternatives.length === 0) {
      errors.alternatives = 'Adicione pelo menos uma alternativa';
    }
    
    if (formData.criteria.length === 0) {
      errors.criteria = 'Adicione pelo menos um critério';
    }
    
    // Check if all performance values are valid
    for (const alt of formData.alternatives) {
      for (let i = 0; i < formData.criteria.length; i++) {
        const values = formData.performance_matrix[alt][i];
        if (values.some(v => isNaN(v) || v < 0 || v > 1)) {
          errors.performance = `Valores de desempenho inválidos para a alternativa ${alt} e critério ${formData.criteria[i]}`;
          break;
        }
      }
    }
    
    // Check if all weights are valid
    for (const crit of formData.criteria) {
      const values = formData.weights[crit];
      if (values.some(v => isNaN(v) || v < 0 || v > 1)) {
        errors.weights = `Pesos inválidos para o critério ${crit}`;
        break;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        method: 'Fuzzy_TOPSIS',
        parameters: formData
      });
      showSnackbar('Cálculo Fuzzy TOPSIS iniciado com sucesso!', 'success');
    } else {
      showSnackbar('Por favor, corrija os erros no formulário antes de continuar.', 'error');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 1, sm: 2, md: 3 }, my: 2 }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Dados de Entrada Fuzzy TOPSIS
        </Typography>

        {/* Linguistic Variables Button */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
          <Button
            variant="outlined"
            startIcon={<InfoIcon />}
            onClick={openLinguisticTable}
            fullWidth={false}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Variáveis Linguísticas
          </Button>
        </Box>

        {/* Step 1: Critérios Section */}
        <Paper variant="outlined" sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: 2,
            gap: { xs: 2, sm: 0 }
          }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Passo 1: Critérios
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Defina os critérios de avaliação, seus tipos e pesos
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => openBulkInput('criteria')}
                sx={{ 
                  mr: { xs: 0, sm: 1 },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Adicionar em Massa
              </Button>
              <Button
                startIcon={<AddIcon />}
                onClick={addCriterion}
                variant="outlined"
                size="small"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Adicionar Critério
              </Button>
            </Box>
          </Box>
          
          {validationErrors.criteria && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationErrors.criteria}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            {formData.criteria.map((crit, critIndex) => (
              <Grid item xs={12} sm={6} md={4} key={crit}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">{crit}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeCriterion(critIndex)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <FormControl fullWidth size="small" sx={{ mb: 1 }}>
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
                  
                  <Typography variant="caption" display="block" gutterBottom>
                    Pesos
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1, 
                    mb: 1 
                  }}>
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
                        sx={{ flex: 1 }}
                      />
                    ))}
                    <Tooltip title="Inserir em massa">
                      <IconButton 
                        size="small" 
                        onClick={() => openWeightInput(crit)}
                        sx={{ 
                          alignSelf: { xs: 'flex-end', sm: 'center' }
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel>Termo Linguístico</InputLabel>
                    <Select
                      value={selectedWeightTerms[crit] || ""}
                      label="Termo Linguístico"
                      onChange={(e) => applyLinguisticWeight(crit, e.target.value)}
                    >
                      <MenuItem value="" disabled>
                        <em>Selecione um termo</em>
                      </MenuItem>
                      {linguisticVariables.weights.map((term) => (
                        <MenuItem key={term.label} value={term.label}>
                          {term.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Step 2: Alternativas Section */}
        <Paper variant="outlined" sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: 2,
            gap: { xs: 2, sm: 0 }
          }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Passo 2: Alternativas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Defina as alternativas a serem avaliadas
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => openBulkInput('alternatives')}
                sx={{ 
                  mr: { xs: 0, sm: 1 },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Adicionar em Massa
              </Button>
              <Button
                startIcon={<AddIcon />}
                onClick={addAlternative}
                variant="outlined"
                size="small"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Adicionar Alternativa
              </Button>
            </Box>
          </Box>
          
          {validationErrors.alternatives && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationErrors.alternatives}
            </Alert>
          )}
          
          {/* Group alternatives in rows of 3 with better spacing */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Array.from({ length: Math.ceil(formData.alternatives.length / 3) }).map((_, rowIndex) => (
              <Box key={`row-${rowIndex}`} sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 3,
                justifyContent: 'flex-start',
                '& > *': { 
                  flex: { 
                    xs: '0 0 100%', 
                    sm: '0 0 calc(50% - 12px)', 
                    md: '0 0 calc(33.333% - 16px)' 
                  }, 
                  minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: '200px' } 
                }
              }}>
                {formData.alternatives.slice(rowIndex * 3, (rowIndex + 1) * 3).map((alt, index) => {
                  const altIndex = rowIndex * 3 + index;
                  return (
                    <Paper 
                      key={alt} 
                      variant="outlined" 
                      sx={{ 
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        position: 'relative',
                        '&:hover': {
                          boxShadow: 2
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        pb: 1
                      }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {alt}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeAlternative(altIndex)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ mt: 'auto', pt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          ID: {altIndex + 1}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Step 3: Matriz de Desempenho Section */}
        <Paper variant="outlined" sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: 2,
            gap: { xs: 2, sm: 0 }
          }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Passo 3: Matriz de Desempenho
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Defina os valores de desempenho para cada alternativa em relação a cada critério
              </Typography>
            </Box>
          </Box>
          
          {validationErrors.performance && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationErrors.performance}
            </Alert>
          )}
          
          <Box sx={{ 
            overflowX: 'auto',
            maxWidth: '100%',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'background.paper',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'primary.light',
              borderRadius: 4,
            },
          }}>
            <Box sx={{ 
              minWidth: { 
                xs: Math.max(600, 100 + (formData.criteria.length * 200)),
                sm: Math.max(800, 150 + (formData.criteria.length * 250))
              },
              width: '100%'
            }}>
              {/* Header row with criteria names */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: `100px repeat(${formData.criteria.length}, 1fr)`,
                  sm: `150px repeat(${formData.criteria.length}, 1fr)`
                }, 
                gap: { xs: 1, sm: 2 }, 
                width: '100%',
                mb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 1
              }}>
                <Box sx={{ 
                  gridColumn: 'span 1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: 1,
                  p: 1
                }}>
                  <Typography variant="subtitle1" fontWeight="medium">Alternativa</Typography>
                </Box>
                {formData.criteria.map((crit) => (
                  <Box 
                    sx={{ 
                      gridColumn: 'span 1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: 1,
                      p: 1
                    }} 
                    key={crit}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">{crit}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Performance matrix rows */}
              {formData.alternatives.map((alt, altIndex) => (
                <Box 
                  sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { 
                      xs: `100px repeat(${formData.criteria.length}, 1fr)`,
                      sm: `150px repeat(${formData.criteria.length}, 1fr)`
                    }, 
                    gap: { xs: 1, sm: 2 }, 
                    width: '100%',
                    mb: 3,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: altIndex % 2 === 0 ? 'background.paper' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    }
                  }} 
                  key={alt}
                >
                  <Box sx={{ 
                    gridColumn: 'span 1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    borderRadius: 1,
                    p: 1,
                    position: 'relative'
                  }}>
                    <Typography variant="subtitle1" fontWeight="medium">{alt}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeAlternative(altIndex)}
                      color="error"
                      sx={{
                        position: 'absolute',
                        right: 4,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: 'error.light'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {formData.criteria.map((crit, critIndex) => (
                    <Box 
                      sx={{ 
                        gridColumn: 'span 1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        minWidth: { xs: '150px', sm: '200px' },
                        bgcolor: 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: 1,
                          borderColor: 'primary.light'
                        }
                      }} 
                      key={`${alt}-${crit}`}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 0.5
                      }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                          Valores Fuzzy (l, m, u)
                        </Typography>
                        <Tooltip title="Inserir em massa">
                          <IconButton 
                            size="small" 
                            onClick={() => openPerformanceInput(alt, crit)}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: 'primary.light'
                              }
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1, 
                        mb: 1 
                      }}>
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
                            sx={{ 
                              flex: 1,
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'primary.light',
                                },
                              },
                            }}
                          />
                        ))}
                      </Box>
                      <FormControl fullWidth size="small">
                        <InputLabel>Termo Linguístico</InputLabel>
                        <Select
                          value={selectedRatingTerms[`${alt}-${critIndex}`] || ""}
                          label="Termo Linguístico"
                          onChange={(e) => applyLinguisticRating(alt, critIndex, e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'divider',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.light',
                            },
                          }}
                        >
                          <MenuItem value="" disabled>
                            <em>Selecione um termo</em>
                          </MenuItem>
                          {linguisticVariables.ratings.map((term) => (
                            <MenuItem key={term.label} value={term.label}>
                              {term.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth
          sx={{ 
            mt: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 }
          }}
        >
          Calcular
        </Button>
      </form>

      {/* Dialog for naming alternatives and criteria */}
      <Dialog 
        open={dialogOpen} 
        onClose={closeDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {dialogType === 'alternative' ? 'Adicionar Alternativa' : 'Adicionar Critério'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={dialogType === 'alternative' ? 'Nome da Alternativa' : 'Nome do Critério'}
            type="text"
            fullWidth
            variant="outlined"
            value={dialogName}
            onChange={(e) => setDialogName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button onClick={handleDialogSubmit} variant="contained" color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for bulk input */}
      <Dialog 
        open={bulkInputOpen} 
        onClose={closeBulkInput}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {bulkInputType === 'alternatives' ? 'Adicionar Alternativas em Massa' : 'Adicionar Critérios em Massa'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={bulkInputType === 'alternatives' ? 'Nomes das Alternativas' : 'Nomes dos Critérios'}
            helperText="Digite os nomes separados por vírgula (ex: A1, A2, A3)"
            type="text"
            fullWidth
            variant="outlined"
            value={bulkInputValue}
            onChange={(e) => setBulkInputValue(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={closeBulkInput}>Cancelar</Button>
          <Button onClick={handleBulkInputSubmit} variant="contained" color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for performance input */}
      <Dialog 
        open={performanceInputOpen} 
        onClose={closePerformanceInput}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Inserir Valor de Desempenho
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Alternativa: <strong>{performanceInputAlt}</strong>
          </Typography>
          <Typography variant="body2" gutterBottom>
            Critério: <strong>{performanceInputCrit}</strong>
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Valores Fuzzy (l, m, u)"
            helperText="Digite os três valores separados por vírgula (ex: 0.3, 0.5, 0.7)"
            type="text"
            fullWidth
            variant="outlined"
            value={performanceInputValue}
            onChange={(e) => setPerformanceInputValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={closePerformanceInput}>Cancelar</Button>
          <Button onClick={handlePerformanceInputSubmit} variant="contained" color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for weight input */}
      <Dialog 
        open={weightInputOpen} 
        onClose={closeWeightInput}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Inserir Peso do Critério
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Critério: <strong>{weightInputCrit}</strong>
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Valores Fuzzy (l, m, u)"
            helperText="Digite os três valores separados por vírgula (ex: 0.3, 0.5, 0.7)"
            type="text"
            fullWidth
            variant="outlined"
            value={weightInputValue}
            onChange={(e) => setWeightInputValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={closeWeightInput}>Cancelar</Button>
          <Button onClick={handleWeightInputSubmit} variant="contained" color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for linguistic variables table */}
      <Dialog 
        open={linguisticTableOpen} 
        onClose={closeLinguisticTable}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Variáveis Linguísticas
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
            Pesos dos Critérios
          </Typography>
          <Box sx={{ 
            overflowX: 'auto',
            maxWidth: '100%',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'background.paper',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'primary.light',
              borderRadius: 4,
            },
          }}>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Termo Linguístico</TableCell>
                    <TableCell align="center">Valor Inferior (l)</TableCell>
                    <TableCell align="center">Valor Médio (m)</TableCell>
                    <TableCell align="center">Valor Superior (u)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {linguisticVariables.weights.map((term) => (
                    <TableRow key={term.label}>
                      <TableCell component="th" scope="row">
                        {term.label}
                      </TableCell>
                      <TableCell align="center">{term.values[0]}</TableCell>
                      <TableCell align="center">{term.values[1]}</TableCell>
                      <TableCell align="center">{term.values[2]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Avaliações de Desempenho
          </Typography>
          <Box sx={{ 
            overflowX: 'auto',
            maxWidth: '100%',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'background.paper',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'primary.light',
              borderRadius: 4,
            },
          }}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Termo Linguístico</TableCell>
                    <TableCell align="center">Valor Inferior (l)</TableCell>
                    <TableCell align="center">Valor Médio (m)</TableCell>
                    <TableCell align="center">Valor Superior (u)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {linguisticVariables.ratings.map((term) => (
                    <TableRow key={term.label}>
                      <TableCell component="th" scope="row">
                        {term.label}
                      </TableCell>
                      <TableCell align="center">{term.values[0]}</TableCell>
                      <TableCell align="center">{term.values[1]}</TableCell>
                      <TableCell align="center">{term.values[2]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={closeLinguisticTable}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ 
            width: '100%',
            maxWidth: { xs: '90%', sm: '400px' }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default FuzzyTopsisForm; 