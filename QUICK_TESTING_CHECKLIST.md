# ⚡ Quick Testing Checklist - Trendora

A condensed version for quick daily testing or smoke testing before deployment.

## 🔥 Critical Path Testing (Must Pass)

### 1. Authentication (5 min)
- [ ] Login with valid credentials ✅
- [ ] Login with invalid credentials shows error ✅
- [ ] Logout works ✅
- [ ] Session persists after refresh ✅

### 2. Role-Based Access (5 min)
- [ ] Admin sees all departments ✅
- [ ] Manager sees only their department ✅
- [ ] Employee sees only Employee Dashboard ✅
- [ ] Unauthorized access blocked ✅

### 3. Core Features by Role (20 min)

#### Admin/HR Testing
- [ ] View employee list ✅
- [ ] Add new employee ✅
- [ ] Edit employee ✅
- [ ] View leave requests ✅
- [ ] Approve/Reject leave ✅

#### Employee Testing
- [ ] View own dashboard ✅
- [ ] Submit leave request ✅
- [ ] View leave history ✅

#### Manager Testing
- [ ] Access department view ✅
- [ ] View team members ✅
- [ ] Perform department operations ✅

### 4. Department Modules (15 min)
- [ ] HR Department loads ✅
- [ ] IT Department loads ✅
- [ ] Marketing Department loads ✅
- [ ] Operations Department loads ✅
- [ ] Accounting Department loads ✅
- [ ] Sales Department loads ✅

### 5. Critical Operations (10 min)
- [ ] Search works ✅
- [ ] Filters work ✅
- [ ] Pagination works ✅
- [ ] Forms submit successfully ✅
- [ ] Validation works ✅
- [ ] Notifications display ✅

### 6. UI/UX (5 min)
- [ ] No console errors ✅
- [ ] Loading states show ✅
- [ ] Responsive on mobile ✅
- [ ] Sidebar works ✅
- [ ] Navigation works ✅

### 7. API & Data (5 min)
- [ ] Data loads correctly ✅
- [ ] Create operations work ✅
- [ ] Update operations work ✅
- [ ] Delete operations work ✅
- [ ] Error handling works ✅

---

## 🎯 Module-Specific Quick Tests

### HR Module (5 min)
```
✅ Employees → Load list → Add one → Edit one → Search
✅ Departments → Load list → View details
✅ Leave Management → Load list → Approve/Reject one
✅ Attendance → Load list → Mark attendance
✅ Payroll → Load list → View details
```

### IT Module (3 min)
```
✅ Load IT dashboard
✅ Search functionality
✅ Pagination works
✅ No 500 errors
```

### Marketing Module (3 min)
```
✅ Load dashboard
✅ View campaigns
✅ View team members
✅ Customer selection works
```

### Operations Module (3 min)
```
✅ Load dashboard
✅ View projects/tasks
✅ Status filters work
✅ Search works
```

### Accounting Module (5 min)
```
✅ Load dashboard
✅ Invoices → List → Create → Edit
✅ Transactions → List → View
✅ Calculations correct
```

### Sales Module (3 min)
```
✅ Load dashboard
✅ View sales data
✅ Charts render
✅ Filters work
```

---

## 📱 Quick Responsive Test (3 min)
- [ ] Mobile (375px) ✅
- [ ] Tablet (768px) ✅
- [ ] Desktop (1920px) ✅

---

## 🌐 Quick Browser Test (10 min)
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅

---

## 🚀 Pre-Deployment Checklist (2 min)

### Build Check
```bash
npm run build
# ✅ Build succeeds without errors
# ✅ No critical warnings
# ✅ Bundle size acceptable
```

### Production Check
- [ ] Environment variables set ✅
- [ ] API endpoints correct ✅
- [ ] No console.log in production ✅
- [ ] Error tracking configured ✅

---

## ⚠️ Red Flags (Stop Deployment If Found)
- ❌ Console errors on page load
- ❌ Cannot login
- ❌ 500 errors on any module
- ❌ Authorization bypass possible
- ❌ Data not loading
- ❌ Critical forms broken
- ❌ Cannot navigate between pages
- ❌ White screen of death
- ❌ App crashes on interaction

---

## 📊 Daily Smoke Test (10 min)
Perfect for daily testing before stand-up:

1. **Login** (1 min): Test with 2-3 different roles
2. **Navigation** (2 min): Click through all main sections
3. **Key Operations** (5 min):
   - Create one employee
   - Submit one leave request
   - Create one invoice
   - View one report
4. **Check** (2 min):
   - Console for errors
   - Network tab for failed requests
   - UI for broken layouts

---

## 🎯 Role-Specific Test Scenarios

### Scenario 1: New Employee Joins (3 min)
```
1. Login as HR ✅
2. Add new employee ✅
3. Assign to department ✅
4. Logout ✅
5. Login as new employee ✅
6. Verify can access employee dashboard ✅
```

### Scenario 2: Leave Request Flow (3 min)
```
1. Login as Employee ✅
2. Submit leave request ✅
3. Logout ✅
4. Login as HR/Manager ✅
5. View pending request ✅
6. Approve request ✅
7. Login as Employee again ✅
8. Verify leave approved ✅
```

### Scenario 3: Invoice Creation (3 min)
```
1. Login as Admin/Accounting ✅
2. Create new invoice ✅
3. Add line items ✅
4. Verify calculations ✅
5. Save invoice ✅
6. View in list ✅
```

---

## 🔍 Quick Bug Hunt (5 min)
Intentionally try to break things:

- [ ] Submit empty forms ✅
- [ ] Enter invalid data ✅
- [ ] Spam click buttons ✅
- [ ] Navigate back quickly ✅
- [ ] Refresh during operations ✅
- [ ] Access unauthorized URLs ✅
- [ ] Try SQL injection in inputs ✅
- [ ] Try XSS in text fields ✅

---

## ✅ Sign-Off

**Tested By**: ________________  
**Date**: ________________  
**Time**: ________________  
**All Critical Tests Passed**: ☐ Yes ☐ No  

**Issues Found**: ________________

---

**Tip**: Use this checklist before every deployment or daily testing. Full checklist (PRE_LAUNCH_TESTING_CHECKLIST.md) for comprehensive testing.

**Estimated Total Time**: 60-90 minutes for complete quick test

