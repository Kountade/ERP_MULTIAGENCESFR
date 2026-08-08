// Utilisateurs.jsx
import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Fab,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  alpha,
  Paper
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import AxiosInstance from '../AxiosInstance'
import { useNavigate } from 'react-router-dom'

const Utilisateurs = () => {
  const navigate = useNavigate()
  const darkCayn = '#003C3f'
  const vividOrange = '#DA4A0E'

  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterAgence, setFilterAgence] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(12)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const roleGlobalOptions = {
    'pdg': 'PDG',
    'drh': 'DRH',
    'autre': 'Autre'
  }

  const getRoleColor = (role) => {
    const colors = {
      'pdg': { bg: '#FFD700', color: '#000' },
      'drh': { bg: '#9C27B0', color: '#fff' },
      'autre': { bg: '#757575', color: '#fff' }
    }
    return colors[role] || { bg: '#757575', color: '#fff' }
  }

  const fetchData = () => {
    setLoading(true)
    AxiosInstance.get('/users/')
      .then((res) => { 
        setUtilisateurs(res.data); 
        setLoading(false) 
      })
      .catch((err) => { 
        console.error(err); 
        setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' }); 
        setLoading(false) 
      })
  }

  useEffect(() => { 
    fetchData() 
  }, [])

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await AxiosInstance.delete(`/users/${userToDelete.id}/`)
      setSnackbar({ open: true, message: 'Utilisateur supprimé', severity: 'success' })
      fetchData()
      setOpenDeleteDialog(false)
      setUserToDelete(null)
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
    }
  }

  const handleToggleActive = async (user) => {
    try {
      await AxiosInstance.patch(`/users/${user.id}/`, { is_active: !user.is_active })
      setSnackbar({ 
        open: true, 
        message: `Utilisateur ${user.is_active ? 'désactivé' : 'activé'}`, 
        severity: 'success' 
      })
      fetchData()
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de la modification', severity: 'error' })
    }
  }

  const filteredUtilisateurs = utilisateurs.filter(u => {
    const search = searchTerm.toLowerCase()
    const email = (u.email || '').toLowerCase()
    const firstName = (u.first_name || '').toLowerCase()
    const lastName = (u.last_name || '').toLowerCase()
    const fullName = `${firstName} ${lastName}`.trim()
    const employeeId = (u.employee_id || '').toLowerCase()
    
    const matchesSearch = !searchTerm || 
      email.includes(search) || 
      firstName.includes(search) || 
      lastName.includes(search) || 
      fullName.includes(search) ||
      employeeId.includes(search)
    
    const matchesRole = !filterRole || u.role_global === filterRole
    
    let matchesAgence = true
    if (filterAgence) {
      matchesAgence = u.agence_principale === parseInt(filterAgence) ||
        (u.roles_agence && u.roles_agence.some(r => r.agence_id === parseInt(filterAgence)))
    }
    
    return matchesSearch && matchesRole && matchesAgence
  })

  const paginatedUtilisateurs = filteredUtilisateurs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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
        <Box>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            sx={{ 
              background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Utilisateurs
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Gérez les utilisateurs et leurs accès
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton 
            onClick={fetchData} 
            sx={{ bgcolor: alpha(darkCayn, 0.1), color: darkCayn }}
          >
            <RefreshIcon />
          </IconButton>
          <Fab 
            onClick={() => navigate('/utilisateurs/nouveau')} 
            sx={{ 
              background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`
            }}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      {/* Filtres */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              placeholder="Rechercher par nom, email, matricule..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              InputProps={{ 
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Rôle global</InputLabel>
              <Select 
                value={filterRole} 
                label="Rôle global" 
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="pdg">PDG</MenuItem>
                <MenuItem value="drh">DRH</MenuItem>
                <MenuItem value="autre">Autre</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => { setFilterRole(''); setFilterAgence(''); setSearchTerm(''); }}
              startIcon={<FilterIcon />}
              sx={{ height: '56px' }}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" color={darkCayn}>
              {utilisateurs.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">Total</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" color={vividOrange}>
              {utilisateurs.filter(u => u.is_active).length}
            </Typography>
            <Typography variant="body2" color="textSecondary">Actifs</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#FFD700' }}>
              {utilisateurs.filter(u => u.role_global === 'pdg').length}
            </Typography>
            <Typography variant="body2" color="textSecondary">PDG</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#9C27B0' }}>
              {utilisateurs.filter(u => u.role_global === 'drh').length}
            </Typography>
            <Typography variant="body2" color="textSecondary">DRH</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Liste des utilisateurs */}
      <Grid container spacing={3}>
        {paginatedUtilisateurs.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
              <PersonIcon sx={{ fontSize: 100, color: alpha(darkCayn, 0.2), mb: 2 }} />
              <Typography variant="h5" color="textSecondary" gutterBottom>
                Aucun utilisateur trouvé
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/utilisateurs/nouveau')}
                sx={{ 
                  mt: 2,
                  background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`
                }}
              >
                Créer un utilisateur
              </Button>
            </Card>
          </Grid>
        ) : (
          paginatedUtilisateurs.map((user) => {
            const roleColor = getRoleColor(user.role_global)
            
            return (
              <Grid item xs={12} md={6} lg={4} key={user.id}>
                <Card sx={{ 
                  position: 'relative',
                  borderLeft: `4px solid ${user.is_active ? vividOrange : '#9e9e9e'}`,
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar 
                        src={user.profile_picture} 
                        sx={{ 
                          bgcolor: user.is_active ? vividOrange : '#9e9e9e',
                          width: 56,
                          height: 56
                        }}
                      >
                        {user.first_name?.[0] || user.email[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : user.email}
                        </Typography>
                        {user.employee_id && (
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <BadgeIcon sx={{ fontSize: 14 }} />
                            {user.employee_id}
                          </Typography>
                        )}
                        <Chip 
                          label={roleGlobalOptions[user.role_global] || 'Autre'}
                          size="small"
                          sx={{ 
                            mt: 0.5,
                            bgcolor: roleColor.bg,
                            color: roleColor.color,
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      {user.email && (
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <EmailIcon fontSize="small" sx={{ color: vividOrange }} />
                          {user.email}
                        </Typography>
                      )}
                      {user.phone && (
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <PhoneIcon fontSize="small" sx={{ color: darkCayn }} />
                          {user.phone}
                        </Typography>
                      )}
                      {user.city && (
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon fontSize="small" sx={{ color: darkCayn }} />
                          {user.city}, {user.country}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mt: 2, 
                      p: 1, 
                      bgcolor: alpha(darkCayn, 0.04), 
                      borderRadius: 2 
                    }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Rôles agence</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {user.roles_agence?.length || 0}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Statut</Typography>
                        <Typography variant="body1" fontWeight="bold" color={user.is_active ? '#4CAF50' : '#9e9e9e'}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Embauché</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {user.hire_date ? new Date(user.hire_date).toLocaleDateString('fr-FR') : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                      <Tooltip title={user.is_active ? 'Désactiver' : 'Activer'}>
                        <IconButton onClick={() => handleToggleActive(user)}>
                          {user.is_active ? 
                            <CheckCircleIcon sx={{ color: '#4CAF50' }} /> : 
                            <CancelIcon sx={{ color: '#9e9e9e' }} />
                          }
                        </IconButton>
                      </Tooltip>
                      <IconButton onClick={() => navigate(`/utilisateurs/${user.id}`)} sx={{ color: vividOrange }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => { setUserToDelete(user); setOpenDeleteDialog(true) }} 
                        sx={{ color: '#d32f2f' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })
        )}
      </Grid>

      {/* Pagination */}
      {filteredUtilisateurs.length > rowsPerPage && (
        <TablePagination 
          component="div" 
          count={filteredUtilisateurs.length} 
          page={page} 
          onPageChange={(e, p) => setPage(p)} 
          rowsPerPage={rowsPerPage} 
          onRowsPerPageChange={(e) => { 
            setRowsPerPage(parseInt(e.target.value)); 
            setPage(0); 
          }} 
          labelRowsPerPage="Lignes par page:"
        />
      )}

      {/* Dialog Suppression */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <DeleteIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Confirmer la suppression</Typography>
          <Typography variant="body1">
            Supprimer l'utilisateur "{userToDelete?.email}" ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error">Supprimer</Button>
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

export default Utilisateurs