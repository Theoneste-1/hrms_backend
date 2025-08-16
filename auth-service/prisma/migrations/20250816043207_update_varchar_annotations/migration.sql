-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE', 'MANAGER', 'INTERN', 'TRAINER', 'AUDITOR', 'HR', 'PAYROLL_MANAGER');

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(100),
    "company_size" VARCHAR(50),
    "subscription_plan" VARCHAR(100) NOT NULL,
    "subscription_status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "billing_cycle" VARCHAR(20) NOT NULL DEFAULT 'monthly',
    "max_employees" INTEGER NOT NULL DEFAULT 100,
    "max_storage_gb" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "last_login" TIMESTAMP(6),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(6),
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_settings" (
    "company_id" UUID NOT NULL,
    "setting_key" VARCHAR(100) NOT NULL,
    "setting_value" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("company_id","setting_key")
);

-- CreateTable
CREATE TABLE "public"."user_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "session_token" VARCHAR(500) NOT NULL,
    "refresh_token" VARCHAR(500) NOT NULL,
    "device_info" JSONB,
    "ip_address" INET,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employees" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID,
    "employee_id" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "date_of_birth" DATE,
    "gender" VARCHAR(20),
    "marital_status" VARCHAR(20),
    "nationality" VARCHAR(100),
    "hire_date" DATE NOT NULL,
    "termination_date" DATE,
    "employment_status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "employment_type" VARCHAR(50) NOT NULL,
    "probation_end_date" DATE,
    "department_id" UUID,
    "position_id" UUID,
    "manager_id" UUID,
    "direct_reports_count" INTEGER NOT NULL DEFAULT 0,
    "base_salary" DECIMAL(12,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "pay_frequency" VARCHAR(20) NOT NULL DEFAULT 'monthly',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "parent_department_id" UUID,
    "manager_id" UUID,
    "budget" DECIMAL(15,2),
    "headcount_limit" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."positions" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "department_id" UUID,
    "level" INTEGER NOT NULL DEFAULT 1,
    "min_salary" DECIMAL(12,2),
    "max_salary" DECIMAL(12,2),
    "requirements" JSONB,
    "responsibilities" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payroll_periods" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "period_name" VARCHAR(100) NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "total_gross_pay" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_taxes" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_net_pay" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "employee_count" INTEGER NOT NULL DEFAULT 0,
    "processed_at" TIMESTAMP(6),
    "paid_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "payroll_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employee_payroll" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "payroll_period_id" UUID NOT NULL,
    "base_salary" DECIMAL(12,2) NOT NULL,
    "overtime_pay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "bonus_pay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "commission_pay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "other_earnings" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(12,2) NOT NULL,
    "tax_withholding" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "social_security" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "medicare" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "health_insurance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "retirement_contribution" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "other_deductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "net_pay" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "calculated_at" TIMESTAMP(6),
    "approved_at" TIMESTAMP(6),
    "paid_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "employee_payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."time_records" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "clock_in" TIMESTAMP(6) NOT NULL,
    "clock_out" TIMESTAMP(6),
    "total_hours" DECIMAL(5,2),
    "clock_in_location" JSONB,
    "clock_out_location" JSONB,
    "device_id" VARCHAR(100),
    "device_type" VARCHAR(50),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_method" VARCHAR(50),
    "notes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "corrected_by" UUID,
    "correctionReason" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "time_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leave_requests" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type" VARCHAR(50) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_days" DECIMAL(4,1) NOT NULL,
    "reason" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "requested_at" TIMESTAMP(6) NOT NULL,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(6),
    "rejection_reason" TEXT,
    "leave_balance_before" DECIMAL(4,1),
    "leave_balance_after" DECIMAL(4,1),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_reviews" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "review_period" VARCHAR(100) NOT NULL,
    "review_type" VARCHAR(50) NOT NULL,
    "review_date" DATE NOT NULL,
    "overall_rating" DECIMAL(3,1),
    "technical_skills" DECIMAL(3,1),
    "communication_skills" DECIMAL(3,1),
    "leadership_skills" DECIMAL(3,1),
    "teamwork" DECIMAL(3,1),
    "initiative" DECIMAL(3,1),
    "strengths" TEXT,
    "areas_for_improvement" TEXT,
    "goals" TEXT,
    "action_plan" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "submitted_at" TIMESTAMP(6),
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_programs" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "difficulty_level" VARCHAR(20),
    "estimated_duration_hours" INTEGER,
    "prerequisites" JSONB,
    "learning_objectives" JSONB,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "training_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_enrollments" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "training_program_id" UUID NOT NULL,
    "enroll_date" DATE NOT NULL,
    "completion_deadline" DATE,
    "progress_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "current_module" VARCHAR(100),
    "final_score" DECIMAL(5,2),
    "certification_earned" BOOLEAN NOT NULL DEFAULT false,
    "certificate_url" VARCHAR(500),
    "status" VARCHAR(50) NOT NULL DEFAULT 'enrolled',
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "training_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_domain_key" ON "public"."companies"("domain");

-- CreateIndex
CREATE INDEX "companies_subscription_status_subscription_plan_idx" ON "public"."companies"("subscription_status", "subscription_plan");

-- CreateIndex
CREATE INDEX "users_company_id_role_idx" ON "public"."users"("company_id", "role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "public"."users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_company_id_key" ON "public"."users"("email", "company_id");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "public"."user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "public"."user_sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "public"."employees"("user_id");

-- CreateIndex
CREATE INDEX "employees_company_id_employment_status_idx" ON "public"."employees"("company_id", "employment_status");

-- CreateIndex
CREATE INDEX "employees_department_id_idx" ON "public"."employees"("department_id");

-- CreateIndex
CREATE INDEX "employees_manager_id_idx" ON "public"."employees"("manager_id");

-- CreateIndex
CREATE INDEX "employees_hire_date_idx" ON "public"."employees"("hire_date");

-- CreateIndex
CREATE INDEX "departments_company_id_idx" ON "public"."departments"("company_id");

-- CreateIndex
CREATE INDEX "departments_parent_department_id_idx" ON "public"."departments"("parent_department_id");

-- CreateIndex
CREATE INDEX "payroll_periods_company_id_period_start_period_end_idx" ON "public"."payroll_periods"("company_id", "period_start", "period_end");

-- CreateIndex
CREATE INDEX "employee_payroll_company_id_status_idx" ON "public"."employee_payroll"("company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "employee_payroll_employee_id_payroll_period_id_key" ON "public"."employee_payroll"("employee_id", "payroll_period_id");

-- CreateIndex
CREATE INDEX "time_records_employee_id_clock_in_idx" ON "public"."time_records"("employee_id", "clock_in" DESC);

-- CreateIndex
CREATE INDEX "time_records_company_id_status_idx" ON "public"."time_records"("company_id", "status");

-- CreateIndex
CREATE INDEX "leave_requests_employee_id_status_idx" ON "public"."leave_requests"("employee_id", "status");

-- CreateIndex
CREATE INDEX "leave_requests_company_id_start_date_end_date_idx" ON "public"."leave_requests"("company_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "performance_reviews_employee_id_review_period_idx" ON "public"."performance_reviews"("employee_id", "review_period");

-- CreateIndex
CREATE INDEX "performance_reviews_reviewer_id_idx" ON "public"."performance_reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "training_enrollments_company_id_status_idx" ON "public"."training_enrollments"("company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "training_enrollments_employee_id_training_program_id_key" ON "public"."training_enrollments"("employee_id", "training_program_id");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_settings" ADD CONSTRAINT "company_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_parent_department_id_fkey" FOREIGN KEY ("parent_department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."positions" ADD CONSTRAINT "positions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."positions" ADD CONSTRAINT "positions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payroll_periods" ADD CONSTRAINT "payroll_periods_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employee_payroll" ADD CONSTRAINT "employee_payroll_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employee_payroll" ADD CONSTRAINT "employee_payroll_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employee_payroll" ADD CONSTRAINT "employee_payroll_payroll_period_id_fkey" FOREIGN KEY ("payroll_period_id") REFERENCES "public"."payroll_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."time_records" ADD CONSTRAINT "time_records_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."time_records" ADD CONSTRAINT "time_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."time_records" ADD CONSTRAINT "time_records_corrected_by_fkey" FOREIGN KEY ("corrected_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leave_requests" ADD CONSTRAINT "leave_requests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leave_requests" ADD CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leave_requests" ADD CONSTRAINT "leave_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_reviews" ADD CONSTRAINT "performance_reviews_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_reviews" ADD CONSTRAINT "performance_reviews_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_reviews" ADD CONSTRAINT "performance_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_programs" ADD CONSTRAINT "training_programs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_enrollments" ADD CONSTRAINT "training_enrollments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_enrollments" ADD CONSTRAINT "training_enrollments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_enrollments" ADD CONSTRAINT "training_enrollments_training_program_id_fkey" FOREIGN KEY ("training_program_id") REFERENCES "public"."training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
