import './App.css'
import Register from './components/Register'
import Login from './components/Login'
import Home from './components/Home'
import Navbar from './components/Navbar'
import { Routes, Route , useLocation} from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoutes'
import PasswordResetRequest from './components/PasswordResetRequest'
import PasswordReset from './components/PasswordReset'

import Agences from './components/agences/Agences'
import CreerAgence from './components/agences/CreerAgence'
import Units from './components/logistique/Units'
import UnitForm from './components/logistique/UnitForm'
import Brands from './components/logistique/Brands'
import BrandForm from './components/logistique/BrandForm'
import Variants from './components/logistique/Variants'
import VariantForm from './components/logistique/VariantForm'
import Products from './components/logistique/Products'
import ProductForm from './components/logistique/ProductForm'
import ProductDetails from './components/logistique/ProductDetails'
import ProductPricingManager from './components/logistique/ProductPricingManager'
import Categories from './components/logistique/Categories'
import CategoryForm from './components/logistique/CategoryForm'
import Utilisateurs from './components/users/Utilisateurs'
import UtilisateurForm from './components/users/UtilisateurForm'
import UtilisateurDetail from './components/users/UtilisateurDetail'
import Fournisseurs from './components/achats/Fournisseurs'
import FournisseurForm from './components/achats/FournisseurForm'
import FournisseurDetail from './components/achats/FournisseurDetail'
import CommandesFournisseurs from './components/achats/CommandesFournisseurs'
import CommandeFournisseurForm from './components/achats/CommandeFournisseurForm'
import CommandeFournisseurDetail from './components/achats/CommandeFournisseurDetail'
import Receptions from './components/achats/Receptions'
import ReceptionForm from './components/achats/ReceptionForm'
import ReceptionDetail from './components/achats/ReceptionDetail'
import Positions from './components/grh/Positions'
import PositionForm from './components/grh/PositionForm'
import Departments from './components/grh/Departments'
import PositionDetail from './components/grh/PositionDetail'
import DepartmentForm from './components/grh/DepartmentForm'
import Employees from './components/grh/Employees'
import EmployeeForm from './components/grh/EmployeeForm'
import EmployeeDetail from './components/grh/EmployeeDetail'
import EmployeeQR from './components/grh/EmployeeQR'
import Leaves from './components/grh/Leaves'
import LeaveForm from './components/grh/LeaveForm'
import LeaveCalendar from './components/grh/LeaveCalendar'
import Payroll from './components/grh/Payroll'
import PayrollForm from './components/grh/PayrollForm'
import PayrollDetail from './components/grh/PayrollDetail'
import PayrollSlip from './components/grh/PayrollSlip'
import Attendance from './components/grh/Attendance'
import AttendanceForm from './components/grh/AttendanceForm'
import Recruitments from './components/grh/Recruitments'
import RecruitmentForm from './components/grh/RecruitmentForm'
import Candidates from './components/grh/Candidates'
import HRStats from './components/grh/HRStats'
import Documents from './components/grh/Documents'
import PerformanceReviews from './components/grh/PerformanceReviews'
import ExpenseClaims from './components/grh/ExpenseClaims'
import Trainings from './components/grh/Trainings'
import Transferts from './components/inventaire/Transferts'
import TransfertForm from './components/inventaire/TransfertForm'
import TransfertDetail from './components/inventaire/TransfertDetail'
import Entrepots from './components/inventaire/entrepots'
import EntrepotDetail from './components/inventaire/EntrepotDetail'
import EntrepotForm from './components/inventaire/EntrepotForm'
import MouvementsStock from './components/inventaire/MouvementsStock'
import MouvementStockDetail from './components/inventaire/MouvementStockDetail'
import Stocks from './components/inventaire/Stocks'
import StockDetail from './components/inventaire/StockDetail'
import AddStockToWarehouse from './components/inventaire/AddStockToWarehouse'
import SalesDashboard from './components/ventes/SalesDashboard'
import ClientsList from './components/ventes/ClientsList'
import ClientForm from './components/ventes/ClientForm'
import ClientDetail from './components/ventes/ClientDetail'
import VentesList from './components/ventes/VentesList'
import VenteForm from './components/ventes/VenteForm'
import VenteDetail from './components/ventes/VenteDetail'
import FacturesList from './components/ventes/FacturesList'
import FactureForm from './components/ventes/FactureForm'
import FactureDetail from './components/ventes/FactureDetail' 
import TransfertPdf from './components/inventaire/TransfertPdf'
import Paiements from './components/ventes/Paiements'
import PaiementForm from './components/ventes/PaiementForm'
import PaiementDetail from './components/ventes/PaiementDetail'
import PaiementPdf from './components/ventes/PaiementPdf'
import DevisList from './components/ventes/DevisList'
import DevisForm from './components/ventes/DevisForm'
import DevisDetail from './components/ventes/DevisDetail'
import DevisPDF from './components/ventes/DevisPDF'
import Livraison from './components/ventes/Livraison'
import Dashboard from './components/dashboard/Dashboard'
import Statistiques from './components/dashboard/Statistiques'
import Analyses from './components/dashboard/Analyses'
import FraisList from './components/achats/FraisList'
import FraisForm from './components/achats/FraisForm'
import FraisDetail from './components/achats/FraisDetail'
import PointDeVente from './components/ventes/PointDeVente'
import ExpenseList from './components/grh/ExpenseList'
import ExpenseDetail from './components/grh/ExpenseDetail'
import ExpenseForm from './components/grh/ExpenseForm'

import Journaux from './components/comptabilite/Journaux'
import JournalForm from './components/comptabilite/JournalForm'
import JournalDetail from './components/comptabilite/JournalDetail'

import DashboardComptable from './components/comptabilite/DashboardComptable'
import PlanComptable from './components/comptabilite/PlanComptable'
import PlanComptableForm from './components/comptabilite/PlanComptableForm'
import EcritureForm from './components/comptabilite/EcritureForm'
import Ecritures from './components/comptabilite/Ecritures'
import EcritureDetail from './components/comptabilite/EcritureDetail'
import EcriturePdf from './components/comptabilite/EcriturePdf'

import Balances from './components/comptabilite/Balances'
import BalanceForm from './components/comptabilite/BalanceForm'
import BalanceDetail from './components/comptabilite/BalanceDetail'

import FacturesComptables from './components/comptabilite/FacturesComptables'
import FactureComptableForm from './components/comptabilite/FactureComptableForm'
import FactureComptableDetail from './components/comptabilite/FactureComptableDetail'

import Reglements from './components/comptabilite/Reglements'
import ReglementForm from './components/comptabilite/ReglementForm'
import ReglementDetail from './components/comptabilite/ReglementDetail'

import Tresorerie from './components/tresorerie/Tresorerie'
import CompteResultat from './components/comptabilite/CompteResultat'

import Caisses from './components/tresorerie/Caisses'
import CaissesDetail from './components/tresorerie/CaissesDetail'
import CaissesForm from './components/tresorerie/CaissesForm'

import ComptesBancaires from './components/tresorerie/ComptesBancaires'
import ComptesBancairesForm from './components/tresorerie/ComptesBancairesForm'
import ComptesBancairesDetail from './components/tresorerie/ComptesBancairesDetail'

import FraisTresorerie from './components/tresorerie/FraisTresorerie'
import FraisTresorerieDetail from './components/tresorerie/FraisTresorerieDetail'
import FraisTresorerieForm from './components/tresorerie/FraisTresorerieForm'

import MouvementsTresorerie from './components/tresorerie/MouvementsTresorerie'
import MouvementsTresorerieForm from './components/tresorerie/MouvementsTresorerieForm'
import MouvementsTresorerieDetail from './components/tresorerie/MouvementsTresorerieDetail'

import PrevisionsTresorerie from './components/tresorerie/PrevisionsTresorerie'
import PrevisionsTresorerieForm from './components/tresorerie/PrevisionsTresorerieForm'
import PrevisionsTresorerieDetail from './components/tresorerie/PrevisionsTresorerieDetail'

import Rapprochements from './components/tresorerie/Rapprochements'
import RapprochementsForm from './components/tresorerie/RapprochementsForm'
import RapprochementsDetail from './components/tresorerie/RapprochementsDetail'

import TresorerieJournaliere from './components/tresorerie/TresorerieJournaliere'

import PriceHistory from './components/achats/PriceHistory'

import Lots from './components/inventaire/Lots'
 

import Bilan from './components/comptabilite/Bilan'

import AuditLog from './components/audit/AuditLog'





function App() {
 
  const location = useLocation()
  // Correction : inverser la condition
  const noNavBar = location.pathname === "/" || location.pathname === "/register" || location.pathname.includes("password")
  
  return (
    <>
    {
      noNavBar ?
      // Pas de Navbar pour login et register
      <Routes>
          <Route path="/register" element={<Register />} />
         <Route path="/" element={<Login />} />
          <Route path="/request/password_reset" element={<PasswordResetRequest/>}/>
          <Route path="/password-reset/:token" element={<PasswordReset/>}/>
      </Routes>
      :
      // Avec Navbar pour les autres routes
      <Navbar 
        content={
      <Routes>
            <Route element={<ProtectedRoute/>}> 
                <Route path="/dashboard" element={<Dashboard />} />
<Route path="/statistiques" element={<Statistiques />} />
<Route path="/analyses" element={<Analyses />} />




<Route path="dashboard/comptabilite" element={<DashboardComptable />} />

<Route path="/plan-comptable" element={<PlanComptable />} />
<Route path="/plan-comptable/nouveau" element={<PlanComptableForm />} />
<Route path="/plan-comptable/:id/modifier" element={<PlanComptableForm />} />

<Route path="/journaux" element={<Journaux />} />
<Route path="/journaux/nouveau" element={<JournalForm />} />
<Route path="/journaux/:id/modifier" element={<JournalForm />} />
<Route path="/journaux/:id" element={<JournalDetail />} />


<Route path="/ecritures" element={<Ecritures />} />
<Route path="/ecritures/nouveau" element={<EcritureForm />} />
<Route path="/ecritures/:id/modifier" element={<EcritureForm />} />
<Route path="/ecritures/:id" element={<EcritureDetail />} />




<Route path="/balances" element={<Balances />} />
<Route path="/balances/nouveau" element={<BalanceForm />} />
<Route path="/balances/:id/modifier" element={<BalanceForm />} />
<Route path="/balances/:id" element={<BalanceDetail />} /> 


<Route path="/factures-comptables" element={<FacturesComptables />} />
<Route path="/factures-comptables/nouveau" element={<FactureComptableForm />} />
<Route path="/factures-comptables/:id/modifier" element={<FactureComptableForm />} />
<Route path="/factures-comptables/:id" element={<FactureComptableForm />} />


<Route path="/reglements" element={<Reglements />} />
<Route path="/reglements/nouveau" element={<ReglementForm />} />
<Route path="/reglements/:id/modifier" element={<ReglementForm />} />
<Route path="/reglements/:id" element={<ReglementDetail />} />

<Route path="/tresorerie/dashboard" element={<Tresorerie />} />

  // Caisses - CRUD complet
          <Route path="/caisses" element={<Caisses />} />
          <Route path="/caisses/nouveau" element={<CaissesForm />} />
          <Route path="/caisses/:id" element={<CaissesDetail />} />
          <Route path="/caisses/:id/edit" element={<CaissesForm />} />

           // Comptes bancaires - CRUD complet
          <Route path="/comptes-bancaires" element={<ComptesBancaires />} />
          <Route path="/comptes-bancaires/nouveau" element={<ComptesBancairesForm />} />
          <Route path="/comptes-bancaires/:id" element={<ComptesBancairesDetail />} />
          <Route path="/comptes-bancaires/:id/edit" element={<ComptesBancairesForm />} />
          
          // Mouvements - CRUD complet
          <Route path="/mouvements-tresorerie" element={<MouvementsTresorerie />} />
          <Route path="/mouvements/nouveau" element={<MouvementsTresorerieForm />} />
          <Route path="/mouvements/:id" element={<MouvementsTresorerieDetail />} />
          <Route path="/mouvements/:id/edit" element={<MouvementsTresorerieForm />} />
          
          // Frais - CRUD complet
          <Route path="/frais" element={<FraisTresorerie />} />
          <Route path="/frais/nouveau" element={<FraisTresorerieForm />} />
          <Route path="/frais/:id" element={<FraisTresorerieDetail />} />
          <Route path="/frais/:id/edit" element={<FraisTresorerieForm />} />
          
          // Prévisions - CRUD complet
          <Route path="/previsions" element={<PrevisionsTresorerie />} />
          <Route path="/previsions/nouveau" element={<PrevisionsTresorerieForm />} />
          <Route path="/previsions/:id" element={<PrevisionsTresorerieDetail />} />
          <Route path="/previsions/:id/edit" element={<PrevisionsTresorerieForm />} />
          
          // Rapprochements - CRUD complet
          <Route path="/rapprochements" element={<Rapprochements />} />
          <Route path="/rapprochements/nouveau" element={<RapprochementsForm />} />
          <Route path="/rapprochements/:id" element={<RapprochementsDetail />} />
          <Route path="/rapprochements/:id/edit" element={<RapprochementsForm />} />
          
          // Trésorerie journalière - Lecture seule
          <Route path="/tresorerie-journaliere" element={<TresorerieJournaliere />} />

<Route path="/compte-resultat" element={<CompteResultat />} />
<Route path="/bilan" element={<Bilan />} />
            
                <Route path="/home" element={<Home/>}/>
               <Route path="/agences" element={<Agences/>}/>
               <Route path="/creer-agence" element={<CreerAgence/>}/>

               
              <Route path="/units" element={<Units/>}/>
               <Route path="/units/nouveau" element={<UnitForm />} />
              <Route path="/units/:id/modifier" element={<UnitForm />} />


               {/* Marques */}
                <Route path="/brands" element={<Brands />} />
                <Route path="/brands/nouveau" element={<BrandForm />} />
                <Route path="/brands/:id/modifier" element={<BrandForm />} /> 

               {/* Variantes (si page dédiée)  */}
               <Route path="/variants" element={<Variants />} />
               <Route path="/variants/nouveau" element={<VariantForm />} />
               <Route path="/variants/:id/modifier" element={<VariantForm />} />

                 {/* Catégories */}
                 <Route path="/categories" element={<Categories />} />
                 <Route path="/categories/nouveau" element={<CategoryForm />} />
                <Route path="/categories/:id/modifier" element={<CategoryForm />} />

<Route path="/price-history" element={<PriceHistory />} />

                   {/* Gestion des produits */}
                        <Route path="/produits" element={<Products />} />
                        <Route path="/produits/nouveau" element={<ProductForm />} />
                        <Route path="/produits/:id" element={<ProductDetails />} />
                        <Route path="/produits/:id/prix" element={<ProductPricingManager />} />
                        <Route path="/produits/:id/modifier" element={<ProductForm />} />
                      

  {/* Gestion des transfert */}

        <Route path="/transferts" element={<Transferts />} />
        <Route path="/transferts/nouveau" element={<TransfertForm />} />
        <Route path="/transferts/:id" element={<TransfertDetail />} />
        <Route path="/transferts/:id/pdf" element={<TransfertPdf />} />

 {/* Gestion des entrepot */}
<Route path="/entrepots" element={<Entrepots />} />
<Route path="/entrepots/:id" element={<EntrepotDetail />} />
<Route path="/entrepots/nouveau" element={<EntrepotForm />} />
<Route path="/entrepots/:id/modifier" element={<EntrepotForm />} />
{/* Gestion des MOUvements de stock */}
<Route path="/mouvements-stock" element={<MouvementsStock />} />
<Route path="/mouvements-stock/:id" element={<MouvementStockDetail />} />


 {/* Gestion des stock */}

 <Route path="/stocks/ajouter" element={<AddStockToWarehouse />} />
<Route path="/stocks" element={<Stocks />} />
<Route path="/stocks/:id" element={<StockDetail />} />

          {/* Gestion des UTILISATEURS */}
                        <Route path="/utilisateurs" element={<Utilisateurs />} />
                        <Route path="/utilisateurs/nouveau" element={<UtilisateurForm />} />
                        <Route path="/utilisateurs/:id/edit" element={<UtilisateurForm />} />
                        <Route path="/utilisateurs/:id" element={<UtilisateurDetail />} />
                          


                          
                       {/* Gestion des Fourniseurs */}
                      <Route path="/fournisseurs" element={<Fournisseurs />} />
                       <Route path="/fournisseurs/nouveau" element={<FournisseurForm />} />
                      <Route path="/fournisseurs/:id/edit" element={<FournisseurForm />} />
                      <Route path="/fournisseurs/:id" element={<FournisseurDetail />} />



  <Route path="/lots" element={<Lots />} />

  {/* Gestion des COMMADES */}
                      <Route path="/commandes-fournisseurs" element={<CommandesFournisseurs />} />
                      <Route path="/commandes-fournisseurs/nouveau" element={<CommandeFournisseurForm />} />
                      <Route path="/commandes-fournisseurs/:id/edit" element={<CommandeFournisseurForm />} />
                      <Route path="/commandes-fournisseurs/:id" element={<CommandeFournisseurDetail />} />

 {/* Gestion des RECEPTIOS */}
<Route path="/receptions" element={<Receptions />} />
<Route path="/receptions/nouveau" element={<ReceptionForm />} />
<Route path="/receptions/:id/edit" element={<ReceptionForm />} />
<Route path="/receptions/:id" element={<ReceptionDetail />} />


 {/* Gestion des RECEPTIOS */}

<Route path="/frais" element={<FraisList />} />
<Route path="/frais/nouveau" element={<FraisForm />} />
<Route path="/frais/:id" element={<FraisDetail />} />
<Route path="/frais/:id/modifier" element={<FraisForm />} />

    {/* Departments */}
          <Route path="/departments" element={<Departments />} />
<Route path="/departments/new" element={<DepartmentForm />} />
<Route path="/departments/:id/edit" element={<DepartmentForm />} />


                       
<Route path="/positions" element={<Positions />} />
<Route path="/positions/new" element={<PositionForm />} />
<Route path="/positions/:id/edit" element={<PositionForm />} />
<Route path="/positions/:id" element={<PositionDetail />} />


  {/* EMPLOYES  */}
<Route path="/employees" element={<Employees />} />
<Route path="/employees/new" element={<EmployeeForm />} />
<Route path="/employees/:id/edit" element={<EmployeeForm />} />
<Route path="/employees/:id" element={<EmployeeDetail />} />
<Route path="/employees/:id/qr" element={<EmployeeQR />} />



        <Route path="/attendance" element={<Attendance />} />
<Route path="/attendance/checkin" element={<AttendanceForm />} />
<Route path="/attendance/checkout" element={<AttendanceForm />} />


 {/* Retours */}
 <Route path="/leaves" element={<Leaves />} />
        <Route path="/leaves/new" element={<LeaveForm />} />

        <Route path="/leaves/calendar" element={<LeaveCalendar />} />


   {/* PAIMET */}
   <Route path="/payroll" element={<Payroll />} />
        <Route path="/payroll/new" element={<PayrollForm />} />
        <Route path="/payroll/:id" element={<PayrollDetail />} />
        <Route path="/payroll/:id/edit" element={<PayrollForm />} />
        <Route path="/payroll/:id/slip" element={<PayrollSlip />} />

<Route path="/expenses" element={<ExpenseList />} />
<Route path="/expenses/new" element={<ExpenseForm />} />
<Route path="/expenses/:id" element={<ExpenseDetail />} />


        // Routes
<Route path="/recruitments" element={<Recruitments />} />
<Route path="/recruitments/new" element={<RecruitmentForm />} />
<Route path="/recruitments/:id/edit" element={<RecruitmentForm />} />
<Route path="/candidates" element={<Candidates />} />
<Route path="/performance" element={<PerformanceReviews />} />
<Route path="/expenses" element={<ExpenseClaims />} />
<Route path="/documents" element={<Documents />} />
<Route path="/stats" element={<HRStats />} />
<Route path="/trainings" element={<Trainings />} />

                      <Route path="/dashboard/ventes" element={<SalesDashboard />} />
                      
<Route path="/clients" element={<ClientsList />} />
<Route path="/clients/nouveau" element={<ClientForm />} />
<Route path="/clients/:id" element={<ClientDetail />} />
<Route path="/clients/:id/modifier" element={<ClientForm />} />


<Route path="/ventes" element={<VentesList />} />
<Route path="/ventes/nouveau" element={<VenteForm />} />
<Route path="/ventes/:id" element={<VenteDetail />} />
<Route path="/point-de-vente" element={<PointDeVente />} />

          <Route path="/factures" element={<FacturesList />} />
          <Route path="/factures/nouveau" element={<FactureForm />} />
          <Route path="/factures/:id" element={<FactureDetail />} />
          <Route path="/factures/:id/modifier" element={<FactureForm />} />

<Route path="/paiements" element={<Paiements />} />
<Route path="/paiements/nouveau" element={<PaiementForm />} />
<Route path="/paiements/:id" element={<PaiementDetail />} />
<Route path="/paiements/:id/edit" element={<PaiementForm />} />
<Route path="/paiements/:id/pdf" element={<PaiementPdf />} />


<Route path="/devis" element={<DevisList />} />
<Route path="/devis/nouveau" element={<DevisForm />} />
<Route path="/devis/:id" element={<DevisDetail />} />
<Route path="/devis/:id/edit" element={<DevisForm />} />

 <Route path="/audit" element={<AuditLog />} />
            </Route>
          </Routes>
        }
        />
    }
    </>
  )
}

export default App