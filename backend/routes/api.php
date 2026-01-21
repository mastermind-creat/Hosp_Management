<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::group([
    'prefix' => 'v1/auth'
], function ($router) {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::post('refresh', [AuthController::class, 'refresh'])->middleware('auth:api');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:api');
});

Route::group([
    'prefix' => 'v1',
    'middleware' => ['auth:api', 'audit']
], function ($router) {
    // User Management
    Route::get('users', [\App\Http\Controllers\UserController::class, 'index'])->middleware('rbac:view_users');
    Route::post('users', [\App\Http\Controllers\UserController::class, 'store'])->middleware('rbac:create_users');
    Route::get('users/{id}', [\App\Http\Controllers\UserController::class, 'show'])->middleware('rbac:view_users');
    Route::put('users/{id}', [\App\Http\Controllers\UserController::class, 'update'])->middleware('rbac:edit_users');
    Route::delete('users/{id}', [\App\Http\Controllers\UserController::class, 'destroy'])->middleware('rbac:delete_users');

    // Role Management
    Route::get('roles', [\App\Http\Controllers\RoleController::class, 'index'])->middleware('rbac:manage_roles');
    Route::get('roles/{id}', [\App\Http\Controllers\RoleController::class, 'show'])->middleware('rbac:manage_roles');
    Route::post('roles', [\App\Http\Controllers\RoleController::class, 'store'])->middleware('rbac:manage_roles');
    Route::put('roles/{id}', [\App\Http\Controllers\RoleController::class, 'update'])->middleware('rbac:manage_roles');
    Route::get('permissions', [\App\Http\Controllers\RoleController::class, 'permissions'])->middleware('rbac:manage_roles');

    // Patient Management
    Route::get('patients', [\App\Http\Controllers\PatientController::class, 'index'])->middleware('rbac:view_patients');
    Route::post('patients', [\App\Http\Controllers\PatientController::class, 'store'])->middleware('rbac:create_patients');
    Route::get('patients/{id}', [\App\Http\Controllers\PatientController::class, 'show'])->middleware('rbac:view_patients');
    Route::put('patients/{id}', [\App\Http\Controllers\PatientController::class, 'update'])->middleware('rbac:edit_patients');
    Route::post('patients/{id}/visits', [\App\Http\Controllers\PatientController::class, 'createVisit'])->middleware('rbac:create_visits');
    Route::get('patients/{id}/visits', [\App\Http\Controllers\PatientController::class, 'visits'])->middleware('rbac:view_visits');

    // Clinical Management
    Route::post('clinical/visits/{id}/vitals', [\App\Http\Controllers\ClinicalController::class, 'storeVitals'])->middleware('rbac:record_vitals');
    Route::post('clinical/visits/{id}/diagnosis', [\App\Http\Controllers\ClinicalController::class, 'recordDiagnosis'])->middleware('rbac:record_diagnosis');
    Route::post('clinical/visits/{id}/notes', [\App\Http\Controllers\ClinicalController::class, 'storeTreatmentNote'])->middleware('rbac:record_vitals');
    Route::post('clinical/visits/{id}/prescriptions', [\App\Http\Controllers\ClinicalController::class, 'storePrescription'])->middleware('rbac:prescribe_drugs');
    Route::post('clinical/visits/{id}/admissions', [\App\Http\Controllers\ClinicalController::class, 'admitPatient'])->middleware('rbac:manage_admissions');
    Route::put('clinical/admissions/{id}/discharge', [\App\Http\Controllers\ClinicalController::class, 'dischargePatient'])->middleware('rbac:manage_admissions');

    // Billing & Financials
    Route::get('invoices', [\App\Http\Controllers\BillingController::class, 'index'])->middleware('rbac:view_invoices');
    Route::post('invoices', [\App\Http\Controllers\BillingController::class, 'store'])->middleware('rbac:create_invoices');
    Route::get('invoices/{id}', [\App\Http\Controllers\BillingController::class, 'show'])->middleware('rbac:view_invoices');
    Route::put('invoices/{id}/void', [\App\Http\Controllers\BillingController::class, 'void'])->middleware('rbac:void_transactions');
    
    Route::post('payments', [\App\Http\Controllers\PaymentController::class, 'store'])->middleware('rbac:record_payments');
    Route::get('reports/daily-summary', [\App\Http\Controllers\PaymentController::class, 'dailySummary'])->middleware('rbac:view_financial_reports');
    Route::post('reports/z-report', [\App\Http\Controllers\PaymentController::class, 'generateZReport'])->middleware('rbac:view_financial_reports');

    // Pharmacy Management
    Route::get('drugs', [\App\Http\Controllers\PharmacyController::class, 'index'])->middleware('rbac:view_drugs');
    Route::post('drugs', [\App\Http\Controllers\PharmacyController::class, 'storeDrug'])->middleware('rbac:manage_drugs');
    Route::post('drugs/{id}/stock', [\App\Http\Controllers\PharmacyController::class, 'addStock'])->middleware('rbac:manage_stock');
    Route::post('pharmacy/dispense', [\App\Http\Controllers\PharmacyController::class, 'dispense'])->middleware('rbac:dispense_drugs');
    Route::get('pharmacy/alerts', [\App\Http\Controllers\PharmacyController::class, 'stockAlerts'])->middleware('rbac:view_drugs');

    // Laboratory Management
    Route::get('lab/tests', [\App\Http\Controllers\LabController::class, 'index'])->middleware('rbac:view_lab_requests');
    Route::post('lab/tests', [\App\Http\Controllers\LabController::class, 'storeTest'])->middleware('rbac:manage_roles'); // Only admin/manager
    Route::get('lab/requests', [\App\Http\Controllers\LabController::class, 'requests'])->middleware('rbac:view_lab_requests');
    Route::post('lab/requests', [\App\Http\Controllers\LabController::class, 'storeRequest'])->middleware('rbac:request_tests');
    Route::post('lab/requests/{id}/sample', [\App\Http\Controllers\LabController::class, 'collectSample'])->middleware('rbac:enter_lab_results');
    Route::post('lab/requests/{id}/results', [\App\Http\Controllers\LabController::class, 'enterResult'])->middleware('rbac:enter_lab_results');
    Route::put('lab/requests/{id}/verify', [\App\Http\Controllers\LabController::class, 'verifyResult'])->middleware('rbac:verify_lab_results');

    // Reports & Analytics
    Route::get('reports/revenue', [\App\Http\Controllers\ReportController::class, 'revenueReport'])->middleware('rbac:view_financial_reports');
    Route::get('reports/dashboard', [\App\Http\Controllers\ReportController::class, 'dashboardStats'])->middleware('rbac:view_reports');
    Route::get('invoices/{id}/export', [\App\Http\Controllers\ReportController::class, 'exportInvoice'])->middleware('rbac:view_invoices');
});
