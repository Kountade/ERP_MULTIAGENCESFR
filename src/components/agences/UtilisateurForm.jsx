// UtilisateurForm.jsx
import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Autocomplete
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SupervisorIcon,
  Store as StoreIcon,
  Warehouse as WarehouseIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material'
import AxiosInstance from '../AxiosInstance'
import { useNavigate, useParams } from 'react-router-dom'

const UtilisateurForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const darkCayn = '#003C3f'
  const vividOrange = '#DA4A0E'

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [agences, setAgences] = useState([])
  const [userRoles, setUserRoles] = useState([])
  const [openRoleDialog, setOpenRoleDialog] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    employee_id: '',
    hire_date: '',
    contract_type: '',
    salary: '',
    role_global: 'autre',
    agence_principale: '',
    is_active: true
  })

  const [roleForm, setRoleForm] = useState({
    agence_id: '',
    role: ''
  })

  const [rolesDisponibles, setRolesDisponibles] = useState([])

  const roleGlobalOptions = {
    'pdg': 'PDG - Accès total',
    'drh': 'DRH - Gestion RH',
    'autre': 'Autre'
  }

  const roleAgenceOptions = {
    'chef_agence': 'Chef d\'agence',
    'gestionnaire_stock': 'Gestionnaire de stock',
    'commercial': 'Commercial'
  }

  const contractTypes = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Intérim']

  const getRoleIcon = (role) => {
    const icons = {
      'pdg': <AdminIcon />,
      'drh': <SupervisorIcon />,
      'chef_agence': <StoreIcon />,
      'gestionnaire_stock': <WarehouseIcon />,
      'commercial': <ShoppingCartIcon />
    }
    return icons[role] || <PersonIcon />
  }

  const getRoleColor = (role) => {
    const colors = {
      'pdg': { bg: '#FFD700', color: '#000' },
      'drh': { bg: '#9C27B0', color: '#fff' },
      'chef_agence': { bg: vividOrange, color: '#fff' },
      'gestionnaire_stock': { bg: '#2196F3', color: '#fff' },
      'commercial': { bg: '#4CAF50', color: '#fff' }
    }
    return colors[role] || { bg: '#757575', color: '#fff' }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const agencesRes = await AxiosInstance.get('/agences/')
      setAgences(agencesRes.data.filter(a => a.est_active) || [])

      if (isEditMode) {
        const userRes = await AxiosInstance.get(`/users/${id}/`)
        const user = userRes.data
        
        setFormData({
          email: user.email || '',
          password: '',
          confirm_password: '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          postal_code: user.postal_code || '',
          country: user.country || 'France',
          employee_id: user.employee_id || '',
          hire_date: user.hire_date || '',
          contract_type: user.contract_type || '',
          salary: user.salary || '',
          role_global: user.role_global || 'autre',
          agence_principale: user.agence_principale || '',
          is_active: user.is_active !== undefined ? user.is_active : true
        })

        // Récupérer les rôles
        try {
          const rolesRes = await AxiosInstance.get(`/users/${id}/roles/`)
          setUserRoles(rolesRes.data || [])
        } catch (e) {
          setUserRoles([])
        }
      }
    } catch (error) {
      console.error(error)
      setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchRolesDisponibles = async (agenceId) => {
    if (!agenceId) {
      setRolesDisponibles([])
      return
    }
    try {
      const response = await AxiosInstance.get(`/agences/${agenceId}/roles_disponibles/`)
      setRolesDisponibles(response.data.roles || [])
    } catch (error) {
      setRolesDisponibles([])
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleRoleFormChange = (e) => {
    const { name, value } = e.target
    setRoleForm(prev => ({ ...prev, [name]: value }))
    
    if (name === 'agence_id') {
      fetchRolesDisponibles(value)
      setRoleForm(prev => ({ ...prev, role: '' }))
    }
  }

  const handleAddRole = async () => {
    if (!roleForm.agence_id || !roleForm.role) {
      setSnackbar({ open: true, message: 'Veuillez sélectionner une agence et un rôle', severity: 'error' })
      return
    }

    try {
      await AxiosInstance.post(`/users/${id}/assign_role/`, roleForm)
      setSnackbar({ open: true, message: 'Rôle assigné avec succès', severity: 'success' })
      
      const rolesRes = await AxiosInstance.get(`/users/${id}/roles/`)
      setUserRoles(rolesRes.data || [])
      
      setOpenRoleDialog(false)
      setRoleForm({ agence_id: '', role: '' })
      setRolesDisponibles([])
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.error || 'Erreur lors de l\'assignation', 
        severity: 'error' 
      })
    }
  }

  const handleRemoveRole = async (roleId) => {
    try {
      await AxiosInstance.delete(`/users/${id}/remove_role/`, { data: { role_id: roleId } })
      setSnackbar({ open: true, message: 'Rôle retiré avec succès', severity: 'success' })
      
      const rolesRes = await AxiosInstance.get(`/users/${id}/roles/`)
      setUserRoles(rolesRes.data || [])
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors du retrait du rôle', severity: 'error' })
    }
  }

  const handleSubmit = async () => {
    if (!formData.email) {
      setSnackbar({ open: true, message: 'L\'email est obligatoire', severity: 'error' })
      return
    }
    
    if (!isEditMode && !formData.password) {
      setSnackbar({ open: true, message: 'Le mot de passe est obligatoire', severity: 'error' })
      return
    }
    
    if (!isEditMode && formData.password !== formData.confirm_password) {
      setSnackbar({ open: true, message: 'Les mots de passe ne correspondent pas', severity: 'error' })
      return
    }

    setSubmitting(true)
    try {
      const submitData = { ...formData }
      delete submitData.confirm_password
      
      if (isEditMode && !submitData.password) {
        delete submitData.password
      }

      if (isEditMode) {
        await AxiosInstance.patch(`/users/${id}/`, submitData)
        setSnackbar({ open: true, message: 'Utilisateur modifié avec succès', severity: 'success' })
      } else {
        await AxiosInstance.post('/register/', submitData)
        setSnackbar({ open: true, message: 'Utilisateur créé avec succès', severity: 'success' })
      }
      
      setTimeout(() => navigate('/utilisateurs'), 1500)
    } catch (error) {
      console.error(error)
      let errorMsg = 'Erreur lors de l\'enregistrement'
      if (error.response?.data) {
        const errors = Object.entries(error.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
        errorMsg = errors
      }
      setSnackbar({ open: true, message: errorMsg, severity: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} sx={{ color: darkCayn }} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          sx={{ 
            background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {isEditMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/utilisateurs')} 
            startIcon={<CancelIcon />} 
            sx={{ borderColor: darkCayn, color: darkCayn }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={submitting} 
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />} 
            sx={{ 
              background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`
            }}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Informations de connexion */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: darkCayn, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon /> Informations de connexion
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Email *" 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                    disabled={isEditMode}
                    helperText={isEditMode ? "L'email ne peut pas être modifié" : ""}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label={isEditMode ? "Nouveau mot de passe" : "Mot de passe *"} 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required={!isEditMode}
                    helperText={isEditMode ? "Laisser vide pour ne pas changer" : ""}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Confirmer le mot de passe" 
                    type="password" 
                    name="confirm_password" 
                    value={formData.confirm_password} 
                    onChange={handleInputChange} 
                    required={!isEditMode}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Informations personnelles */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: darkCayn, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon /> Informations personnelles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Prénom" 
                    name="first_name" 
                    value={formData.first_name} 
                    onChange={handleInputChange} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Nom" 
                    name="last_name" 
                    value={formData.last_name} 
                    onChange={handleInputChange} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Téléphone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment>
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Adresse */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: darkCayn, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon /> Adresse
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Adresse" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    multiline 
                    rows={2} 
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    fullWidth 
                    label="Code postal" 
                    name="postal_code" 
                    value={formData.postal_code} 
                    onChange={handleInputChange} 
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    fullWidth 
                    label="Ville" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    fullWidth 
                    label="Pays" 
                    name="country" 
                    value={formData.country} 
                    onChange={handleInputChange} 
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Informations professionnelles */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: darkCayn, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon /> Informations professionnelles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Matricule" 
                    name="employee_id" 
                    value={formData.employee_id} 
                    onChange={handleInputChange} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    type="date" 
                    label="Date d'embauche" 
                    name="hire_date" 
                    value={formData.hire_date} 
                    onChange={handleInputChange} 
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    freeSolo
                    options={contractTypes}
                    value={formData.contract_type}
                    onChange={(e, newValue) => setFormData(prev => ({ ...prev, contract_type: newValue || '' }))}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Type de contrat" 
                        name="contract_type" 
                        onChange={handleInputChange}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    type="number" 
                    label="Salaire" 
                    name="salary" 
                    value={formData.salary} 
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Rôle et agence */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: darkCayn, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon /> Rôle et agence
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Rôle global</InputLabel>
                    <Select 
                      name="role_global" 
                      value={formData.role_global} 
                      label="Rôle global" 
                      onChange={handleInputChange}
                    >
                      {Object.entries(roleGlobalOptions).map(([key, label]) => (
                        <MenuItem key={key} value={key}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Agence principale</InputLabel>
                    <Select 
                      name="agence_principale" 
                      value={formData.agence_principale} 
                      label="Agence principale" 
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">Aucune</MenuItem>
                      {agences.map(agence => (
                        <MenuItem key={agence.id} value={agence.id}>
                          {agence.nom} ({agence.type_agence === 'principale' ? 'Principale' : 'Secondaire'})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Rôles par agence (uniquement en édition) */}
        {isEditMode && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: darkCayn, fontWeight: 600 }}>
                    Rôles par agence
                  </Typography>
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={() => setOpenRoleDialog(true)} 
                    size="small" 
                    sx={{ color: vividOrange }}
                  >
                    Assigner un rôle
                  </Button>
                </Box>
                <Divider />
                
                {userRoles.length === 0 ? (
                  <Typography color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
                    Aucun rôle assigné
                  </Typography>
                ) : (
                  <List>
                    {userRoles.map((roleData) => {
                      const agence = agences.find(a => a.id === roleData.agence_id)
                      const roleColor = getRoleColor(roleData.role)
                      
                      return (
                        <ListItem
                          key={roleData.id}
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              onClick={() => handleRemoveRole(roleData.id)}
                              sx={{ color: '#d32f2f' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                          sx={{ 
                            bgcolor: alpha(darkCayn, 0.02), 
                            borderRadius: 2, 
                            mb: 1 
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: roleColor.bg, color: roleColor.color }}>
                              {getRoleIcon(roleData.role)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" fontWeight="medium">
                                  {roleAgenceOptions[roleData.role] || roleData.role}
                                </Typography>
                                <Chip 
                                  label={agence?.nom || `Agence #${roleData.agence_id}`}
                                  size="small"
                                  icon={<BusinessIcon />}
                                />
                              </Box>
                            }
                            secondary={`Assigné le ${new Date(roleData.date_attribution).toLocaleDateString('fr-FR')}`}
                          />
                        </ListItem>
                      )
                    })}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Statut */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: darkCayn, fontWeight: 600 }}>
                Statut
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormControlLabel 
                control={
                  <Switch 
                    checked={formData.is_active} 
                    onChange={handleInputChange} 
                    name="is_active" 
                    color="success" 
                  />
                } 
                label="Utilisateur actif" 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Assignation de rôle */}
      <Dialog 
        open={openRoleDialog} 
        onClose={() => {
          setOpenRoleDialog(false)
          setRoleForm({ agence_id: '', role: '' })
          setRolesDisponibles([])
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`, 
          color: 'white' 
        }}>
          Assigner un rôle
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Agence</InputLabel>
                <Select
                  name="agence_id"
                  value={roleForm.agence_id}
                  label="Agence"
                  onChange={handleRoleFormChange}
                >
                  {agences.map(agence => (
                    <MenuItem key={agence.id} value={agence.id}>
                      {agence.nom} ({agence.type_agence === 'principale' ? 'Principale' : 'Secondaire'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth disabled={!roleForm.agence_id}>
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="role"
                  value={roleForm.role}
                  label="Rôle"
                  onChange={handleRoleFormChange}
                >
                  {rolesDisponibles.map(role => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenRoleDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleAddRole} 
            variant="contained" 
            sx={{ background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)` }}
          >
            Assigner
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default UtilisateurForm