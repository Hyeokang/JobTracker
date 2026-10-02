CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    normalized_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_companies_normalized_name UNIQUE (normalized_name)
);

CREATE TABLE job_postings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    position VARCHAR(100),
    career_requirement VARCHAR(100),
    employment_type VARCHAR(30),
    location VARCHAR(100),
    started_date DATE,
    deadline DATE,
    requirements VARCHAR(5000),
    preferred_qualifications VARCHAR(5000),
    original_url VARCHAR(2048),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_job_postings_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_job_postings_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT uk_job_postings_user_url UNIQUE (user_id, original_url)
);

CREATE INDEX idx_job_postings_user_created_at ON job_postings (user_id, created_at DESC);
CREATE INDEX idx_job_postings_company ON job_postings (company_id);
